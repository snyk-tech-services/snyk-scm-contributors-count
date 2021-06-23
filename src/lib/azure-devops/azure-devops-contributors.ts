import {
  AzureDevopsTarget,
  Username,
  Contributor,
  ContributorMap,
} from "../types";
import { Commits, Repo } from "./types";
import { getRepoCommits, getReposPerProjects } from "./utils"; 

import * as debugLib from "debug";
const azureDefaultUrl = "https://dev.azure.com/";
const debug = debugLib("snyk:azure-devops-count");

export const fetchAzureDevopsContributors = async (
  azureInfo: AzureDevopsTarget,
  SnykMonitoredRepos: string[],
  threeMonthsDate: string
): Promise<ContributorMap> => {
  const contributorsMap = new Map<Username, Contributor>();
  try {
    let repoList: Repo[] = [];

    if (
      azureInfo.repo &&
      (!azureInfo.projectKeys ||
        azureInfo.projectKeys.length > 1)
    ) {
      // If repo is specified, then a single project key is expected, bail otherwise
      console.log("You must provide a single project for single repo counting");
      process.exit(1);
    } else if (azureInfo.repo) {
      // If repo is specified, and we got a single project key
      debug("Counting contributors for single repo");
      if(azureInfo.projectKeys){
      repoList.push({
        name: azureInfo.repo,
        project: { key: azureInfo.projectKeys[0] },
      });
    }
    } else {
      // Otherwise retrieve all repos (for given projects or all repos)
      repoList = repoList.concat(
        await fetchAzureReposForProjects(azureInfo)
      );
    }

    if(SnykMonitoredRepos && SnykMonitoredRepos.length > 0){
      repoList = repoList.filter(repo => SnykMonitoredRepos.includes(`${repo.project.key}/${repo.name}`) || SnykMonitoredRepos.includes(`${repo.project.name}/${repo.name}`))
    }


    for (let i = 0; i < repoList.length; i++) {
      await fetchAzureContributorsForRepo(
        azureInfo,
        repoList[i],
        contributorsMap,
        threeMonthsDate
      );
    }
  } catch (err) {
    debug("Failed to retrieve contributors from Azure Devops.\n" + err);
    console.log(
      "Failed to retrieve contributors from Azure Devops. Try running with `DEBUG=snyk* snyk-contributor`"
    );
     }
    debug(contributorsMap);
    return contributorsMap;
};

export const fetchAzureContributorsForRepo = async (
  AzureInfo: AzureDevopsTarget,
  repo: Repo,
  contributorsMap: ContributorMap,
  threeMonthsDate: string
): Promise<void> => {
  try {
    debug(
      `Fetching single repo contributor from Azure Devops. Project ${repo.project.key} - Repo ${repo.name}\n`
    );
    const response = (await getRepoCommits(
      azureDefaultUrl + AzureInfo.OrgName,
      repo.project.key,
      repo.name,
      AzureInfo.token,
      threeMonthsDate
    ));
    const result = await response.text();
    const parsedResponse = JSON.parse(result).value as Commits[];
    for (let i = 0; i < parsedResponse.length; i++) {
      const commit = parsedResponse[i];
      let contributionsCount = 1;
      let reposContributedTo = [`${repo.project.name || repo.project.key}/${repo.name}`];

      if (contributorsMap && contributorsMap.has(commit.author.name)) {
        contributionsCount =
          contributorsMap.get(commit.author.name)?.contributionsCount || 0;
        contributionsCount++;

        reposContributedTo =
          contributorsMap.get(commit.author.name)?.reposContributedTo || [];
        if (!reposContributedTo.includes(`${repo.project.name || repo.project.key}/${repo.name}`)) {
          // Dedupping repo list here
          reposContributedTo.push(`${repo.project.name}/${repo.name}`);
        }
      }
      contributorsMap.set(commit.author.name, {
        email: commit.author.email,
        contributionsCount: contributionsCount,
        reposContributedTo: reposContributedTo,
      });
    }
  } catch (err) {
    debug("Failed to retrieve commits from Azure Devops.\n" + err);
    console.log(
      "Failed to retrieve commits from Azure Devops. Try running with `DEBUG=snyk* snyk-contributor`"
    );
  }
};

export const fetchAzureReposForProjects = async (
  AzureInfo: AzureDevopsTarget
): Promise<Repo[]> => {
  const repoList: Repo[] = [];
  if(AzureInfo.projectKeys){
  try {
    for (let i = 0; i < AzureInfo.projectKeys.length; i ++){
      const repos = await getReposPerProjects(
        azureDefaultUrl + AzureInfo.OrgName,
      AzureInfo.projectKeys[i],
      AzureInfo.token
    );
    const result = await repos.text();
    const parsedResponse = JSON.parse(result).value;
    parsedResponse.map((repo: { name: string; project: {id: string, name: string}; }) => {
      const {name, project} = repo;
      if (name && project && project.id && project.name) {
        repoList.push({ name, project: { key : project.id, name: project.name } })
      }
    })
    }
  } catch (err) {
    debug("Failed to retrieve repo list from Azure Devops.\n" + err);
    console.log(
      "Failed to retrieve repo list from Azure Devops. Try running with `DEBUG=snyk* snyk-contributor`"
    );
  } 
}
return repoList;
};
