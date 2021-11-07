import { ConsolidatedContributor, ContributorMap } from '../types';

export const isValidFile = async (fileStr: string): Promise<boolean> => {
  if (fileStr != '') {
    if (!isJson(fileStr)) {
      return false;
    } else {
      try {
        const fileJson = JSON.parse(fileStr);
        if (
          fileJson.contributorsDetails &&
          fileJson.contributorsDetails.length > 0
        ) {
          return true;
        }
      } catch (err) {
        return false;
      }
    }
  }
  return false;
};

const isJson = async (str: string): Promise<boolean> => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

export const findAndUpdateContributorInArray = async (
  contributorFromFile: ConsolidatedContributor,
  contributorList: ConsolidatedContributor[],
): Promise<ConsolidatedContributor> => {
  const contributor: ConsolidatedContributor = contributorFromFile;
  for (let i = 0; i < contributorList.length; i++) {
    if (contributorList[i].contributor.email == contributor.contributor.email) {
      contributor.contributor.contributionsCount +=
        contributorList[i].contributor.contributionsCount;
      for (
        let j = 0;
        j < contributorList[i].contributor.reposContributedTo.length;
        j++
      ) {
        contributor.contributor.reposContributedTo.push(
          contributorList[i].contributor.reposContributedTo[j],
        );
      }
    }
  }
  return contributor;
};

export const createContributorListFromFile = async (
  fileBuffer: Buffer,
): Promise<ConsolidatedContributor[]> => {
  const contributorsFromFile: ConsolidatedContributor[] = [];
  const fileJson = JSON.parse(fileBuffer.toString());
  for (let k = 0; k < fileJson.contributorsDetails.length; k++) {
    const contrib: ConsolidatedContributor = {
      name: fileJson.contributorsDetails[k][0],
      contributor: {
        email: fileJson.contributorsDetails[k][1]['email'],
        contributionsCount:
          fileJson.contributorsDetails[k][1]['contributionsCount'],
        reposContributedTo: [],
      },
    };
    for (
      let l = 0;
      l < fileJson.contributorsDetails[k][1]['reposContributedTo'].length;
      l++
    ) {
      contrib.contributor.reposContributedTo.push(
        fileJson.contributorsDetails[k][1]['reposContributedTo'][l],
      );
    }
    contributorsFromFile.push(contrib);
  }
  return contributorsFromFile;
};

export const createMapFromArray = async (
  consolidatedContriburosList: ConsolidatedContributor[],
): Promise<ContributorMap> => {
  const mappedList: ContributorMap = new Map([]);
  for (let x = 0; x < consolidatedContriburosList.length; x++) {
    mappedList.set(consolidatedContriburosList[x].name, {
      email: consolidatedContriburosList[x].contributor.email,
      contributionsCount:
        consolidatedContriburosList[x].contributor.contributionsCount,
      reposContributedTo:
        consolidatedContriburosList[x].contributor.reposContributedTo,
    });
  }
  return mappedList;
};
