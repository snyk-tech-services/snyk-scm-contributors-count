import {
  AzureDevopsTarget,
  Username,
  Contributor,
  ContributorMap,
  Integration,
} from '../types';
import { Commits, Repo, Project } from './types';
import { getRepoCommits, getReposPerProjects, getProjects } from './utils';
import { createImportFile, genericRepo, genericTarget } from '../common/utils';

import * as debugLib from 'debug';
const azureDefaultUrl = 'https://dev.azure.com/';
const debug = debugLib('snyk:azure-devops-count');

export const fetchAzureDevopsContributors = async (
  azureInfo: AzureDevopsTarget,
  SnykMonitoredRepos: string[],
  integrations: Integration[],
  importConfDir: string,
  importFileRepoType: string,
  threeMonthsDate: string,
): Promise<ContributorMap> => {
  const contributorsMap = new Map<Username, Contributor>();
  try {
    let repoList: Repo[] = [];
    let projectList: Project[] = [];
    let filePath = '';
    if (
      azureInfo.repo &&
      (!azureInfo.projectKeys || azureInfo.projectKeys.length > 1)
    ) {
      // If repo is specified, then a single project key is expected, bail otherwise
      console.log('You must provide a single project for single repo counting');
      process.exit(1);
    } else if (azureInfo.repo) {
      // If repo is specified, and we got a single project key
      debug('Counting contributors for single repo');
      if (azureInfo.projectKeys) {
        repoList.push({
          name: azureInfo.repo,
          project: { key: azureInfo.projectKeys[0] },
        });
      }
    } else if (!azureInfo.projectKeys) {
      azureInfo.projectKeys = [];
      projectList = projectList.concat(
        await fetchAzureProjects(
          azureDefaultUrl,
          azureInfo.OrgName,
          azureInfo.token,
        ),
      );
      for (let i = 0; i < projectList.length; i++) {
        azureInfo.projectKeys.push(projectList[i].name);
      }
      repoList = repoList.concat(await fetchAzureReposForProjects(azureInfo));
    } else {
      // Otherwise retrieve all repos (for given projects or all repos)
      repoList = repoList.concat(await fetchAzureReposForProjects(azureInfo));
    }
    // Create an api-import files for unmonitored repos
    if (importConfDir) {
      const unmonitoredRepos: Repo[] = repoList.filter(
        (repo) =>
          !SnykMonitoredRepos.includes(`${repo.project.name}/${repo.name}`) ||
          !SnykMonitoredRepos.includes(`${repo.project.name}/${repo.name}`),
      );
      filePath = await createImportFile(
        unmonitoredRepos,
        integrations,
        importConfDir,
        importFileRepoType,
        'azure-devops',
        filterRepoList,
        orgNameFromRepo,
        populateUnmonitoredRepoList,
      );
    }
    if (filePath != '') {
      console.log(`Import file was created at ${filePath}`);
    }
    if (SnykMonitoredRepos && SnykMonitoredRepos.length > 0) {
      repoList = repoList.filter(
        (repo) =>
          SnykMonitoredRepos.includes(`${repo.project.key}/${repo.name}`) ||
          SnykMonitoredRepos.includes(`${repo.project.name}/${repo.name}`),
      );
    }

    for (let i = 0; i < repoList.length; i++) {
      await fetchAzureContributorsForRepo(
        azureInfo,
        repoList[i],
        contributorsMap,
        threeMonthsDate,
      );
    }
  } catch (err) {
    debug('Failed to retrieve contributors from Azure Devops.\n' + err);
    console.log(
      'Failed to retrieve contributors from Azure Devops. Try running with `DEBUG=snyk* snyk-contributor`',
    );
  }
  debug(contributorsMap);
  return contributorsMap;
};

export const fetchAzureContributorsForRepo = async (
  AzureInfo: AzureDevopsTarget,
  repo: Repo,
  contributorsMap: ContributorMap,
  threeMonthsDate: string,
): Promise<void> => {
  try {
    debug(
      `Fetching single repo contributor from Azure Devops. Project ${repo.project.key} - Repo ${repo.name}\n`,
    );
    const response = await getRepoCommits(
      azureDefaultUrl + AzureInfo.OrgName,
      repo.project.key,
      repo.name,
      AzureInfo.token,
      threeMonthsDate,
    );
    const result = await response.text();
    const parsedResponse = JSON.parse(result).value as Commits[];
    for (let i = 0; i < parsedResponse.length; i++) {
      const commit = parsedResponse[i];
      let contributionsCount = 1;
      let reposContributedTo = [
        `${repo.project.name || repo.project.key}/${repo.name}(${
          repo.project.visibility
        })`,
      ];

      if (contributorsMap && contributorsMap.has(commit.author.name)) {
        contributionsCount =
          contributorsMap.get(commit.author.name)?.contributionsCount || 0;
        contributionsCount++;

        reposContributedTo =
          contributorsMap.get(commit.author.name)?.reposContributedTo || [];
        if (
          !reposContributedTo.includes(
            `${repo.project.name || repo.project.key}/${repo.name}(${
              repo.project.visibility
            })`,
          )
        ) {
          // Dedupping repo list here
          reposContributedTo.push(
            `${repo.project.name}/${repo.name}(${repo.project.visibility})`,
          );
        }
      }
      if (
        !commit.author.email.endsWith('@users.noreply.github.com') &&
        commit.author.email != 'snyk-bot@snyk.io'
      ) {
        contributorsMap.set(commit.author.name, {
          email: commit.author.email,
          contributionsCount: contributionsCount,
          reposContributedTo: reposContributedTo,
        });
      }
    }
  } catch (err) {
    debug('Failed to retrieve commits from Azure Devops.\n' + err);
    console.log(
      'Failed to retrieve commits from Azure Devops. Try running with `DEBUG=snyk* snyk-contributor`',
    );
  }
};

export const fetchAzureReposForProjects = async (
  AzureInfo: AzureDevopsTarget,
): Promise<Repo[]> => {
  const repoList: Repo[] = [];
  if (AzureInfo.projectKeys) {
    try {
      for (let i = 0; i < AzureInfo.projectKeys.length; i++) {
        const repos = await getReposPerProjects(
          azureDefaultUrl + AzureInfo.OrgName,
          AzureInfo.projectKeys[i],
          AzureInfo.token,
        );
        const result = await repos.text();
        const parsedResponse = JSON.parse(result).value;
        parsedResponse.map(
          (repo: {
            name: string;
            project: { id: string; name: string; visibility: string };
            defaultBranch: string;
          }) => {
            const { name, project, defaultBranch } = repo;
            if (name && project && project.id && project.name) {
              repoList.push({
                name,
                project: {
                  key: project.id,
                  name: project.name,
                  visibility: project.visibility,
                },
                defaultBranch: defaultBranch,
              });
            }
          },
        );
      }
    } catch (err) {
      debug('Failed to retrieve repo list from Azure Devops.\n' + err);
      console.log(
        'Failed to retrieve repo list from Azure Devops. Try running with `DEBUG=snyk* snyk-contributor`',
      );
    }
  }
  return repoList;
};

export const fetchAzureProjects = async (
  azureDefaultUrl: string,
  OrgName: string,
  token: string,
): Promise<Project[]> => {
  const projectList: Project[] = [];
  try {
    const projects = await getProjects(azureDefaultUrl, OrgName, token);
    const result = await projects.text();
    const parsedResponse = JSON.parse(result).value;
    parsedResponse.map((project: { name: string; id: string }) => {
      const { name, id } = project;
      if (name && id) {
        projectList.push({ id: project.id, name: project.name });
      }
    });
  } catch (err) {
    debug('Failed to retrieve project list from Azure Devops.\n' + err);
    console.log(
      'Failed to retrieve project list from Azure Devops. Try running with `DEBUG=snyk* snyk-contributor`',
    );
  }
  return projectList;
};

export const filterRepoList = async (
  unmonitoredRepoList: genericRepo[],
  repoType: string,
): Promise<genericRepo[]> => {
  let reTypedRepoList = unmonitoredRepoList as Repo[];
  if (repoType.toLowerCase() == 'private') {
    reTypedRepoList = reTypedRepoList.filter(
      (repo) => repo.project.visibility?.toLocaleLowerCase() == 'private',
    );
  } else if (repoType.toLowerCase() == 'public') {
    reTypedRepoList = reTypedRepoList.filter(
      (repo) => repo.project.visibility?.toLocaleLowerCase() == 'public',
    );
  }
  return reTypedRepoList;
};

export const orgNameFromRepo = async (repo: genericRepo): Promise<string> => {
  const reTypedRepo = repo as Repo;
  return reTypedRepo.project.name!;
};

export const populateUnmonitoredRepoList = async (
  repo: genericRepo,
  integration: Integration,
  orgID: string,
  integrationID: string,
): Promise<genericTarget[]> => {
  const reTypedRepo = repo as Repo;
  const targetList: genericTarget[] = [];
  targetList.push({
    integrationId: integration.integrations['azure-repos'] || integrationID,
    orgId: integration.org.id || orgID,
    target: {
      name: reTypedRepo.name,
      owner: reTypedRepo.project.name!,
      branch: reTypedRepo.defaultBranch || 'master',
    },
  });
  return targetList;
};
