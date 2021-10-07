import { GitlabTarget, Username, Contributor, ContributorMap } from '../types';
import { Commits, Project, Group, User } from './types';
import { fetchAllPages } from './utils';

import * as debugLib from 'debug';
const gitlabDefaultUrl = 'https://gitlab.com/';
const debug = debugLib('snyk:gitlab-count');

export const fetchGitlabContributors = async (
  gitlabInfo: GitlabTarget,
  SnykMonitoredRepos: string[],
  threeMonthsDate: string,
): Promise<ContributorMap> => {
  const contributorsMap = new Map<Username, Contributor>();
  try {
    let projectList: Project[] = [];
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
    } else {
      // Otherwise retrieve all projects (for given groups or all projects)
      projectList = projectList.concat(
        await fetchGitlabProjects(
          gitlabInfo.url ? gitlabInfo.url : gitlabDefaultUrl,
          gitlabInfo,
        ),
      );
    }

    if (SnykMonitoredRepos && SnykMonitoredRepos.length > 0) {
      projectList = projectList.filter((project) =>
        SnykMonitoredRepos.includes(`${project.path_with_namespace}`),
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
  return contributorsMap;
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

      if (contributorsMap && contributorsMap.has(commit.author_name)) {
        contributionsCount =
          contributorsMap.get(commit.author_name)?.contributionsCount || 0;
        contributionsCount++;

        reposContributedTo =
          contributorsMap.get(commit.author_name)?.reposContributedTo || [];
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
      contributorsMap.set(commit.author_name, {
        email: commit.author_email,
        contributionsCount: contributionsCount,
        reposContributedTo: reposContributedTo,
      });
    }
  } catch (err) {
    debug('Failed to retrieve commits from Gitlab.\n' + err);
    console.log(
      'Failed to retrieve commits from Gitlab. Try running with `DEBUG=snyk* snyk-contributor`',
    );
  }
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
        }) => {
          const { path_with_namespace, id } = project;
          if (path_with_namespace && id) {
            projectList.push({
              id: project.id,
              path_with_namespace: project.path_with_namespace,
              visibility: project.visibility,
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
