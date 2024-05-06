import {
  ContributorMap,
  Contributor,
  ContributorMapWithSummary,
  Integration,
} from '../../lib/types';
import * as debugLib from 'debug';
import readline = require('readline');
import fs = require('fs');
import {
  Repo as bitbucketCloudRepo,
  Target as bitbucketCloudTarget,
} from '../bitbucket-cloud/types';
import {
  Repo as azureRepo,
  Target as azureTarget,
} from '../azure-devops/types';
import {
  Repo as bitbucketServerRepo,
  Target as bitbucketServerTarget,
} from '../bitbucket-server/types';
import { Repo as githubRepo, Target as githubTarget } from '../github/types';
import {
  Repo as githubEnterpriseRepo,
  Target as githubEnterpriseTarget,
} from '../github-enterprise/types';
import {
  Project as gitlabProject,
  Target as gitlabTarget,
} from '../gitlab/types';

const debug = debugLib('snyk:dedup');
export const privateReposContributors: string[] = [];
export const publicReposContributors: string[] = [];
export const undefinedReposContributors: string[] = [];

let orgID = '';
let integrationID = '';

export const dedupContributorsByEmail = (
  contributorsMap: ContributorMap,
): ContributorMap => {
  const deduppedContributorsMap = contributorsMap;
  const contributorsMapToReturn = new Map<string, Contributor>();
  for (const [username, contributor] of contributorsMap) {
    const contributorsMapMinusContributor = contributorsMap;
    contributorsMapMinusContributor.delete(username);
    let duplicateEmailKey = returnKeyIfEmailFoundInMap(
      contributorsMapMinusContributor,
      contributor.email,
    );
    if (duplicateEmailKey) {
      while (duplicateEmailKey) {
        if (duplicateEmailKey) {
          const duplicateEntry =
            contributorsMapMinusContributor.get(duplicateEmailKey);
          // we know it's there since that's how we found it with returnKeyIfEmailFoundInMap
          contributor.reposContributedTo =
            contributor.reposContributedTo.concat(
              duplicateEntry!.reposContributedTo,
            );
          contributor.reposContributedTo = dedupRepos(
            contributor.reposContributedTo,
          );
          contributor.contributionsCount += duplicateEntry!.contributionsCount;
          deduppedContributorsMap.delete(duplicateEmailKey);
          deduppedContributorsMap.delete(username);
          contributorsMapToReturn.set(username, contributor);
        }
        duplicateEmailKey = returnKeyIfEmailFoundInMap(
          contributorsMapMinusContributor,
          contributor.email,
        );
      }
    } else {
      contributorsMapToReturn.set(username, contributor);
    }
  }

  return contributorsMapToReturn;
};

export const dedupRepos = (list: string[]): string[] => {
  return [...new Set(list)];
};

export const returnKeyIfEmailFoundInMap = (
  map: ContributorMap,
  email: string,
): string => {
  for (const [key, value] of map) {
    if (value.email.replace(' ', '') === email.replace(' ', '')) {
      return key;
    }
  }
  return '';
};

export const calculateSummaryStats = (
  deduppedMap: ContributorMap,
  exclusionCount: number,
): ContributorMapWithSummary => {
  const contributionsCount = deduppedMap.size;
  const uniqueRepoList = getUniqueReposFromMap(deduppedMap);
  return {
    contributorsCount: contributionsCount,
    repoCount: uniqueRepoList.length,
    repoList: uniqueRepoList,
    exclusionCount: exclusionCount,
    contributorsDetails: deduppedMap,
  };
};

export const getUniqueReposFromMap = (map: ContributorMap): string[] => {
  let repoList: string[] = [];
  map.forEach((item) => {
    repoList = repoList.concat(item.reposContributedTo);
  });
  return dedupRepos(repoList);
};

export const serializeMapToJson = (map: ContributorMap): string => {
  return JSON.stringify(Array.from(map.entries()));
};

export function serializeMapFromJson(jsonStr: string): ContributorMap {
  return new Map(JSON.parse(jsonStr));
}

const contributorCountForRepo = (
  repoName: string,
  contributorsDetalis: ContributorMapWithSummary,
): string[] => {
  const detailsArray = Array.from(
    contributorsDetalis.contributorsDetails.entries(),
  );
  const contList: string[] = [];
  for (let i = 0; i < detailsArray.length; i++) {
    for (let j = 0; j < detailsArray[i][1].reposContributedTo.length; j++) {
      if (
        detailsArray[i][1].reposContributedTo[j]
          .toLowerCase()
          .includes(repoName.toLowerCase())
      ) {
        contList.push(detailsArray[i][1].email);
      }
    }
  }
  return contList;
};

export const filteredRepoList = (
  resultMap: ContributorMapWithSummary,
  FilterType: string,
): string[] => {
  const filteredList: string[] = [];
  for (let i = 0; i < resultMap.repoList.length; i++) {
    if (
      resultMap.repoList[i]
        .toLowerCase()
        .toString()
        .endsWith(FilterType.toLowerCase())
    ) {
      const repoDetails: string[] = contributorCountForRepo(
        resultMap.repoList[i].toLowerCase().toString(),
        resultMap,
      );
      filteredList.push(
        `${resultMap.repoList[i]} - Contributors count: ${repoDetails.length}`,
      );
      for (let j = 0; j < repoDetails.length; j++) {
        switch (FilterType.toLowerCase()) {
          case '(private)':
            if (!privateReposContributors.includes(repoDetails[j])) {
              privateReposContributors.push(repoDetails[j]);
            }
            break;
          case '(public)':
            if (!publicReposContributors.includes(repoDetails[j])) {
              publicReposContributors.push(repoDetails[j]);
            }
            break;
          case '(undefined)':
            if (!undefinedReposContributors.includes(repoDetails[j])) {
              undefinedReposContributors.push(repoDetails[j]);
            }
        }
      }
    }
  }
  return filteredList;
};

export type genericRepo =
  | azureRepo
  | bitbucketCloudRepo
  | bitbucketServerRepo
  | githubRepo
  | githubEnterpriseRepo
  | gitlabProject;

export type genericTarget =
  | azureTarget
  | bitbucketCloudTarget
  | bitbucketServerTarget
  | githubTarget
  | githubEnterpriseTarget
  | gitlabTarget;

export const createImportFile = async (
  unmonitoredRepoList: genericRepo[],
  integrations: Integration[],
  path: string,
  repoType: string,
  scmType: string,
  filterRepoList: (
    unmonitoredRepoList: genericRepo[],
    repoType: string,
  ) => Promise<genericRepo[]>,
  getScmOrgName: (repo: genericRepo) => Promise<string>,
  populateTargetList: (
    repo: genericRepo,
    integration: Integration,
    orgID: string,
    integrationID: string,
  ) => Promise<genericTarget[]>,
): Promise<string> => {
  let userPromptedForDetails = false;
  let targetList: genericTarget[] = [];
  console.log(`Found ${unmonitoredRepoList.length} unmonitored repos`);
  const filteredUnmonitoredRepoList: genericRepo[] = await filterRepoList(
    unmonitoredRepoList,
    repoType,
  );

  console.log(`Applied the ${repoType} filter to the repo list`);
  console.log(`Filtered list has ${filteredUnmonitoredRepoList.length} repos`);

  for (let i = 0; i < filteredUnmonitoredRepoList.length; i++) {
    const integration = await findIntegrationData(
      await getScmOrgName(filteredUnmonitoredRepoList[i]),
      integrations,
    );
    if (
      (Object.keys(integration.integrations).length == 0 ||
        integration.org.id == '') &&
      !userPromptedForDetails
    ) {
      const provideDetails = await promptUserForDetails(
        'Missing Org ID and/or Integration ID for some repos, would you like to provide them? [Y/N] ',
      );
      if (provideDetails.toString().toLowerCase() == 'y') {
        orgID = await promptUserForDetails(
          'Please provide a valid Snyk Org ID : ',
        );
        integrationID = await promptUserForDetails(
          'Please provide the integration ID for the Org you provided earlier : ',
        );
        console.log(
          `Applying OrgID: ${orgID} and IntegrationID: ${integrationID}`,
        );
        debug(`Applying OrgID: ${orgID} and IntegrationID: ${integrationID}`);
        userPromptedForDetails = true;
      } else {
        userPromptedForDetails = true;
      }
    }
    targetList = targetList.concat(
      await populateTargetList(
        filteredUnmonitoredRepoList[i],
        integration,
        orgID,
        integrationID,
      ),
    );
  }

  const addParentToJson = { targets: targetList };

  if (!path.endsWith('/')) {
    path += '/';
  }
  const fullPathToFile = `${path}${scmType}-Import-File.json`;
  fs.writeFile(
    fullPathToFile,
    JSON.stringify(addParentToJson, null, 4),
    'utf-8',
    (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Import file created');
      }
    },
  );
  return fullPathToFile;
};

export const findIntegrationData = async (
  org: string,
  integrations: Integration[],
): Promise<Integration> => {
  let integration: Integration = {
    org: { name: '', id: '' },
    integrations: {},
  };
  for (let i = 0; i < integrations.length; i++) {
    if (integrations[i].org.name == org) {
      integration = integrations[i];
    }
  }
  return integration;
};

export const promptUserForDetails = async (
  question: string,
): Promise<string> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });
  return new Promise((resolve) =>
    rl.question(question, (ans) => {
      rl.close();
      resolve(ans);
    }),
  );
};
