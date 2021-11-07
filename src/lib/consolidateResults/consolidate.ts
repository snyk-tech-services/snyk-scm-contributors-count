import {
  isValidFile,
  findAndUpdateContributorInArray,
  createContributorListFromFile,
  createMapFromArray,
} from './utils/index';
import fs = require('fs');
import * as debugLib from 'debug';
import { ConsolidatedContributor, ContributorMap } from './types';

const debug = debugLib('snyk:consolidate');
const consolidatedContriburosList: ConsolidatedContributor[] = [];

export const consolidateResults = async (
  folderPath: string,
): Promise<ContributorMap> => {
  const files = fs.readdirSync(folderPath, { withFileTypes: true });
  const filesNames = files
    .filter((files) => files.isFile())
    .map((files) => files.name);
  for (let i = 0; i < filesNames.length; i++) {
    const fileContent = fs.readFileSync(`${folderPath}/${filesNames[i]}`);
    const isAValidFile = await isValidFile(fileContent.toString());
    if (isAValidFile) {
      debug(`Found a valid file: ${filesNames[i]}, reading data`);
      const contributorsFromFile: ConsolidatedContributor[] =
        await createContributorListFromFile(fileContent);
      for (let j = 0; j < contributorsFromFile.length; j++) {
        const isContributorInArray = await findAndUpdateContributorInArray(
          contributorsFromFile[j],
          consolidatedContriburosList,
        );
        if (
          consolidatedContriburosList.find(
            (item) =>
              item.contributor.email == isContributorInArray.contributor.email,
          )
        ) {
          consolidatedContriburosList[
            consolidatedContriburosList.findIndex(
              (item) =>
                item.contributor.email ==
                isContributorInArray.contributor.email,
            )
          ] = isContributorInArray;
        } else {
          consolidatedContriburosList.push(isContributorInArray);
        }
      }
    } else {
      debug(
        `File : ${filesNames[i]} is not a valid file for consolidation or has no entries`,
      );
    }
  }
  return await createMapFromArray(consolidatedContriburosList);
};
