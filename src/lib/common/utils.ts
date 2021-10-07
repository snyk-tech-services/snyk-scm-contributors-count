import {
  ContributorMap,
  Contributor,
  ContributorMapWithSummary,
} from '../../lib/types';
import * as debugLib from 'debug';

const debug = debugLib('snyk:dedup');
export const privateReposContributors: string[] = [];
export const publicReposContributors: string[] = [];
export const undefinedReposContributors: string[] = [];

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
