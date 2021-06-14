import { ContributorMap, Contributor, ContributorMapWithSummary } from "../../lib/types";
import * as debugLib from "debug";

const debug = debugLib("snyk:bitbucket-server-dedup");

export const dedupContributorsByEmail = (
  contributorsMap: ContributorMap
): ContributorMap => {
  let deduppedContributorsMap = contributorsMap;
  let contributorsMapToReturn = new Map<string, Contributor>();
  for (let [username, contributor] of contributorsMap) {
    const contributorsMapMinusContributor = contributorsMap;
    contributorsMapMinusContributor.delete(username);
    let duplicateEmailKey = returnKeyIfEmailFoundInMap(
      contributorsMapMinusContributor,
      contributor.email
    );
    if (duplicateEmailKey) {
      while (duplicateEmailKey) {
        if (duplicateEmailKey) {
          const duplicateEntry =
            contributorsMapMinusContributor.get(duplicateEmailKey);
          // we know it's there since that's how we found it with returnKeyIfEmailFoundInMap
          contributor.reposContributedTo =
            contributor.reposContributedTo.concat(
              duplicateEntry!.reposContributedTo
            );
          contributor.reposContributedTo = dedupRepos(
            contributor.reposContributedTo
          );
          contributor.contributionsCount += duplicateEntry!.contributionsCount;
          deduppedContributorsMap.delete(duplicateEmailKey);
          deduppedContributorsMap.delete(username);
          contributorsMapToReturn.set(username, contributor);
        }
        duplicateEmailKey = returnKeyIfEmailFoundInMap(
          contributorsMapMinusContributor,
          contributor.email
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
  email: string
): string => {
  for (let [key, value] of map) {
    if (value.email.replace(" ","") === email.replace(" ","")) {   
      return key;
    }
  }
  return "";
};


export const calculateSummaryStats = (deduppedMap: ContributorMap, exclusionCount: number):ContributorMapWithSummary => {
    const contributionsCount = deduppedMap.size
    const uniqueRepoList = getUniqueReposFromMap(deduppedMap)
    return {contributorsCount: contributionsCount, repoCount: uniqueRepoList.length, repoList: uniqueRepoList,exclusionCount: exclusionCount, contributorsDetails: deduppedMap}
}

export const getUniqueReposFromMap = (map:ContributorMap): string[] => {
    let repoList: string[] = []
    map.forEach((item) => {
        repoList = repoList.concat(item.reposContributedTo)
    })
    return dedupRepos(repoList)
}

export const serializeMapToJson = (map: ContributorMap) => {
  return JSON.stringify(Array.from(map.entries()));
};

export function serializeMapFromJson(jsonStr: string): ContributorMap {
  return new Map(JSON.parse(jsonStr));
}
