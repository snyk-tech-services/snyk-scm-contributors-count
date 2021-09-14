import { GitlabTarget, Username, Contributor, ContributorMap } from '../types';
import { Commits, Project } from './types';
import { fetchAllPages } from './utils';

import * as debugLib from 'debug';
const gitlabDefaultUrl = 'https://gitlab.com/';
const debug = debugLib('snyk:gitlab-count');

export const fetchGitlabContributors = async (
  gitlabInfo: GitlabTarget,
  threeMonthsDate: string,
): Promise<ContributorMap> => {
  const contributorsMap = new Map<Username, Contributor>();
  try {
    let projectList: Project[] = [];
    // If project is specified
    debug('Counting contributors for single project/repository');
    if (gitlabInfo.projectKeys) {
      for (let i = 0; i < gitlabInfo.projectKeys.length; i++) {
        projectList.push({
          id: gitlabInfo.projectKeys[i],
        });
      }
    } else {
      gitlabInfo.projectKeys = [];
      projectList = projectList.concat(
        await fetchGitlabProjects(
          gitlabInfo.host ? gitlabInfo.host : gitlabDefaultUrl,
          gitlabInfo.token,
        ),
      );
      for (let i = 0; i < projectList.length; i++) {
        gitlabInfo.projectKeys.push(projectList[i].id);
      }
    }

    for (let i = 0; i < projectList.length; i++) {
      await fetchGitlabContributorsForProject(
        gitlabInfo.host ? gitlabInfo.host : gitlabDefaultUrl,
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
  host: string,
  gitlabInfo: GitlabTarget,
  project: Project,
  contributorsMap: ContributorMap,
  threeMonthsDate: string,
): Promise<void> => {
  try {
    debug(
      `Fetching single project/repo contributor from Gitlab. Project ${project.path_with_namespace} - ID ${project.id}\n`,
    );
    const encodedProjectPath = encodeURIComponent(project.id);
    const response = (await fetchAllPages(
      host +
        `api/v4/projects/${encodedProjectPath}/repository/commits?since=${threeMonthsDate}`,
      gitlabInfo.token,
    )) as Commits[];
    for (let i = 0; i < response.length; i++) {
      const commit = response[i];
      let contributionsCount = 1;
      let reposContributedTo = [`${project.path_with_namespace || project.id}`];

      if (contributorsMap && contributorsMap.has(commit.author_name)) {
        contributionsCount =
          contributorsMap.get(commit.author_name)?.contributionsCount || 0;
        contributionsCount++;

        reposContributedTo =
          contributorsMap.get(commit.author_name)?.reposContributedTo || [];
        if (
          !reposContributedTo.includes(
            `${project.path_with_namespace || project.id}`,
          )
        ) {
          // Dedupping repo list here
          reposContributedTo.push(
            `${project.path_with_namespace || project.id}`,
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
  token: string,
): Promise<Project[]> => {
  const projectList: Project[] = [];
  try {
    const url = host.includes('gitlab.com')
      ? 'api/v4/projects?per_page=100&membership=true'
      : 'api/v4/projects?per_page=100';
    const projects = (await fetchAllPages(host + url, token)) as Project[];
    projects.map(
      (project: {
        path_with_namespace?: string;
        id: string;
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
  } catch (err) {
    debug('Failed to retrieve project list from Gitlab.\n' + err);
    console.log(
      'Failed to retrieve project list from Gitlab. Try running with `DEBUG=snyk* snyk-contributor`',
    );
  }
  return projectList;
};
