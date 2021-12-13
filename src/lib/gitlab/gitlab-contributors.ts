import {
  GitlabTarget,
  Username,
  Contributor,
  ContributorMap,
  Integration,
} from '../types';
import { Commits, Project, Group, User } from './types';
import { fetchAllPages } from './utils';
import * as debugLib from 'debug';
import { createImportFile, genericRepo, genericTarget } from '../common/utils';

const gitlabDefaultUrl = 'https://gitlab.com/';
const debug = debugLib('snyk:gitlab-count');

export const fetchGitlabContributors = async (
  gitlabInfo: GitlabTarget,
  SnykMonitoredRepos: string[],
  integrations: Integration[],
  importConfDir: string,
  importFileRepoType: string,
  threeMonthsDate: string,
): Promise<ContributorMap> => {
  const contributorsMap = new Map<Username, Contributor>();
  let filePath = '';
  try {
    let projectList: Project[] = [];
    if (importConfDir && (!SnykMonitoredRepos || !integrations)) {
      console.log('No org or integration data was found');
    }
    // In Gitlab there's no need to provide a group for fetching project details, the project's path/namespace is enough
    if (gitlabInfo.project) {
      debug('Counting contributors for single project');
      projectList.push({
        path_with_namespace: gitlabInfo.project,
      });
    } else if (gitlabInfo.groups && !gitlabInfo.project) {
      let groupsList: Group[] = [];
      for (let i = 0; i < gitlabInfo.groups.length; i++) {
        groupsList = groupsList.concat(
          await findGroupPaths(
            gitlabInfo.url ? gitlabInfo.url : gitlabDefaultUrl,
            gitlabInfo.token,
            gitlabInfo.groups[i],
          ),
        );
      }
      gitlabInfo.groups = [];
      for (let j = 0; j < groupsList.length; j++) {
        gitlabInfo.groups.push(
          encodeURIComponent(groupsList[j].full_path.toString()),
        );
      }
      projectList = projectList.concat(
        await fetchGitlabProjects(
          gitlabInfo.url ? gitlabInfo.url : gitlabDefaultUrl,
          gitlabInfo,
        ),
      );
      debug(`Found ${groupsList.length} Groups`);
    } else {
      // Otherwise retrieve all projects (for given groups or all projects)
      projectList = projectList.concat(
        await fetchGitlabProjects(
          gitlabInfo.url ? gitlabInfo.url : gitlabDefaultUrl,
          gitlabInfo,
        ),
      );
    }
    debug(`Found ${projectList.length} Projects`);
    // Create an api-import files for unmonitored repos
    if (importConfDir) {
      const unmonitoredProjects: Project[] = projectList.filter(
        (project) =>
          !SnykMonitoredRepos.includes(`${project.path_with_namespace}`),
      );
      filePath = await createImportFile(
        unmonitoredProjects,
        integrations,
        importConfDir,
        importFileRepoType,
        'gitlab',
        filterRepoList,
        orgNameFromRepo,
        populateUnmonitoredRepoList,
      );
    }
    if (filePath != '') {
      console.log(`Import file was created at ${filePath}`);
    }
    if (SnykMonitoredRepos && SnykMonitoredRepos.length > 0) {
      projectList = projectList.filter((project) =>
        SnykMonitoredRepos.some((monitoredRepo) => {
          return monitoredRepo
            .replace('.git', '')
            .endsWith(`${project.path_with_namespace}`);
        }),
      );
    }

    for (let i = 0; i < projectList.length; i++) {
      await fetchGitlabContributorsForProject(
        gitlabInfo.url ? gitlabInfo.url : gitlabDefaultUrl,
        gitlabInfo,
        projectList[i],
        contributorsMap,
        threeMonthsDate,
      );
    }
  } catch (err) {
    debug('Failed to retrieve contributors from Gitlab.\n' + err);
    console.log(
      'Failed to retrieve contributors from Gitlab. Try running with `DEBUG=snyk* snyk-contributor`',
    );
  }
  debug(contributorsMap);
  return new Map([...contributorsMap.entries()].sort());
};

export const fetchGitlabContributorsForProject = async (
  url: string,
  gitlabInfo: GitlabTarget,
  project: Project,
  contributorsMap: ContributorMap,
  threeMonthsDate: string,
): Promise<void> => {
  try {
    debug(
      `Fetching single project/repo contributor from Gitlab. Project ${project.path_with_namespace} - ID ${project.id}\n`,
    );
    const encodedProjectPath = encodeURIComponent(project.path_with_namespace);
    const response = (await fetchAllPages(
      url +
        `api/v4/projects/${encodedProjectPath}/repository/commits?since=${threeMonthsDate}&per_page=100`,
      gitlabInfo.token,
      project.id,
    )) as Commits[];
    for (let i = 0; i < response.length; i++) {
      const commit = response[i];
      let contributionsCount = 1;
      let reposContributedTo = [
        `${project.path_with_namespace || project.id}(${project.visibility})`,
      ];

      if (
        contributorsMap &&
        (contributorsMap.has(commit.author_name) ||
          contributorsMap.has(commit.author_email))
      ) {
        contributionsCount = contributorsMap.get(commit.author_email)
          ?.contributionsCount
          ? contributorsMap.get(commit.author_email)!.contributionsCount
          : contributorsMap.get(commit.author_name)?.contributionsCount || 0;
        contributionsCount++;

        reposContributedTo = contributorsMap.get(commit.author_email)
          ?.reposContributedTo
          ? contributorsMap.get(commit.author_email)!.reposContributedTo
          : contributorsMap.get(commit.author_name)?.reposContributedTo || [];
        if (
          !reposContributedTo.includes(
            `${project.path_with_namespace || project.id}(${
              project.visibility
            })`,
          )
        ) {
          // Dedupping repo list here
          reposContributedTo.push(
            `${project.path_with_namespace || project.id}(${
              project.visibility
            })`,
          );
        }
      }
      const isDuplicateName = await changeDuplicateAuthorNames(
        commit.author_name,
        commit.author_email,
        contributorsMap,
      );
      if (
        !commit.author_email.endsWith('@users.noreply.github.com') &&
        commit.author_email != 'snyk-bot@snyk.io'
      ) {
        contributorsMap.set(isDuplicateName, {
          email: commit.author_email,
          contributionsCount: contributionsCount,
          reposContributedTo: reposContributedTo,
        });
      }
    }
  } catch (err) {
    debug('Failed to retrieve commits from Gitlab.\n' + err);
    console.log(
      'Failed to retrieve commits from Gitlab. Try running with `DEBUG=snyk* snyk-contributor`',
    );
  }
};

const changeDuplicateAuthorNames = async (
  name: string,
  email: string,
  contributorMap: ContributorMap,
): Promise<string> => {
  for (const [username, contributor] of contributorMap) {
    if (username == name && email != contributor.email) {
      return `${name}(duplicate)`;
    }
  }
  return name;
};

export const fetchGitlabProjects = async (
  host: string,
  gitlabInfo: GitlabTarget,
): Promise<Project[]> => {
  const projectList: Project[] = [];
  const user = (await fetchAllPages(
    `${host}api/v4/user`,
    gitlabInfo.token,
    'User',
  )) as User[];
  const fullUrlSet: string[] = !gitlabInfo.groups
    ? [
        host.includes('gitlab.com')
          ? 'api/v4/projects?per_page=100&membership=true'
          : 'api/v4/projects?per_page=100',
      ]
    : gitlabInfo.groups.map(
        (group) => `api/v4/groups/${group}/projects?per_page=100`,
      );
  if (gitlabInfo.groups) {
    fullUrlSet.push(`api/v4/users/${user[0].id}/projects?per_page=100`);
  }
  try {
    for (let i = 0; i < fullUrlSet.length; i++) {
      const projects = (await fetchAllPages(
        host + fullUrlSet[i],
        gitlabInfo.token,
        'Projects',
      )) as Project[];
      projects.map(
        (project: {
          path_with_namespace: string;
          id?: string;
          visibility?: string;
          default_branch?: string;
        }) => {
          const { path_with_namespace, id } = project;
          if (path_with_namespace && id) {
            projectList.push({
              id: project.id,
              path_with_namespace: project.path_with_namespace,
              visibility: project.visibility,
              default_branch: project.default_branch,
            });
          }
        },
      );
    }
  } catch (err) {
    debug('Failed to retrieve project list from Gitlab.\n' + err);
    console.log(
      'Failed to retrieve project list from Gitlab. Try running with `DEBUG=snyk* snyk-contributor`',
    );
  }
  return projectList;
};

export const findGroupPaths = async (
  host: string,
  token: string,
  groupName: string,
): Promise<Group[]> => {
  const groupsList: Group[] = [];
  try {
    const groups = (await fetchAllPages(
      `${host}api/v4/groups?all_available=true&search=${groupName}`,
      token,
      'Groups',
    )) as Group[];
    groups.map((group: { id?: string; name?: string; full_path: string }) => {
      const { id, name, full_path } = group;
      if (id && name && full_path) {
        groupsList.push({
          id: group.id,
          name: group.name,
          full_path: group.full_path,
        });
      }
    });
  } catch (err) {
    debug('Failed to retrieve group from Gitlab.\n' + err);
    console.log(
      'Failed to retrieve group from Gitlab. Try running with `DEBUG=snyk* snyk-contributor`',
    );
  }
  return groupsList;
};

export const filterRepoList = async (
  unmonitoredRepoList: genericRepo[],
  repoType: string,
): Promise<genericRepo[]> => {
  let reTypedRepoList = unmonitoredRepoList as Project[];
  if (repoType.toLowerCase() == 'private') {
    reTypedRepoList = reTypedRepoList.filter(
      (project) =>
        project.visibility?.toLowerCase() == 'private' ||
        project.visibility?.toLowerCase() == 'internal',
    );
  } else if (repoType.toLowerCase() == 'public') {
    reTypedRepoList = reTypedRepoList.filter(
      (project) => project.visibility?.toLowerCase() == 'public',
    );
  }
  return reTypedRepoList;
};

export const orgNameFromRepo = async (
  project: genericRepo,
): Promise<string> => {
  const reTypedRepo = project as Project;
  return reTypedRepo.path_with_namespace.split('/')[0];
};

export const populateUnmonitoredRepoList = async (
  project: genericRepo,
  integration: Integration,
  orgID: string,
  integrationID: string,
): Promise<genericTarget[]> => {
  const reTypedProject = project as Project;
  const targetList: genericTarget[] = [];
  if (reTypedProject.id) {
    targetList.push({
      integrationId: integration.integrations['gitlab'] || integrationID,
      orgId: integration.org.id || orgID,
      target: {
        id: reTypedProject.id!,
        branch: reTypedProject.default_branch || 'master',
      },
    });
  } else {
    console.log(
      `Could not find Project ID for ${reTypedProject.path_with_namespace}, skipping`,
    );
    debug(
      `Could not find Project ID for ${reTypedProject.path_with_namespace}, skipping`,
    );
  }
  return targetList;
};
