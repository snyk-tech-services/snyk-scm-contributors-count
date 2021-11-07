import * as debugLib from 'debug';
import { ContributorMapWithSummary, Output } from '../types';
import * as chalk from 'chalk';
import {
  privateReposContributors,
  publicReposContributors,
  undefinedReposContributors,
  filteredRepoList,
} from './utils';
import fs = require('fs');

const debug = debugLib('snyk:count-output');

export const printOutResults = (
  resultMap: ContributorMapWithSummary,
  isJsonOutput = false,
  fileOutputPath?: string,
): void => {
  debug(resultMap);
  const output: Output = {
    privateRepoList: filteredRepoList(resultMap, '(private)'),
    publicRepoList: filteredRepoList(resultMap, '(public)'),
    contributorsCount: resultMap.contributorsCount,
    repoCount: resultMap.repoCount,
    undefinedRepoList: filteredRepoList(resultMap, '(undefined)'),
    exclusionCount: resultMap.exclusionCount,
    contributorsDetails: Array.from(resultMap.contributorsDetails.entries()),
  };
  if (isJsonOutput) {
    console.log(JSON.stringify(output, null, 4));
  } else {
    console.log(`\n${chalk.yellowBright('#### Summary')}`);
    console.log(
      `${chalk.blueBright(
        '** This summary indicates the number of contributors who have made at least one commit in the last 90 days to repositories **\n',
      )}`,
    );
    console.log(
      `Private Repos Contributors Count: ${privateReposContributors.length}`,
    );
    console.log(
      `Public Repos Contributors Count: ${publicReposContributors.length}`,
    );
    if (output.undefinedRepoList.length > 0) {
      console.log(
        `Undefined Repos Contributors Count: ${undefinedReposContributors.length}`,
      );
    }
    console.log(
      `Total Unique Contributors Count for Private and Public repositories: ${output.contributorsCount}`,
    );
    console.log(`Private Repository Count: ${output.privateRepoList.length}`);
    console.log(`Public Repository Count: ${output.publicRepoList.length}`);
    if (output.undefinedRepoList.length > 0) {
      console.log(
        `Undefined Repository Count: ${output.undefinedRepoList.length}`,
      );
    }
    console.log(`Total Repository Count: ${output.repoCount}`);
    console.log(`Exclusion Count: ${output.exclusionCount}`);
    if (output.contributorsCount > 0) {
      console.log(`\n\n${chalk.yellowBright('### Details:')}`);
      console.log(`## Repository List\n`);
      console.log(`# Private Repositories:`);
      console.log(`${output.privateRepoList.join('\n')}\n`);
      console.log(`# Public Repositories:`);
      console.log(`${output.publicRepoList.join('\n')}\n`);
      if (output.undefinedRepoList.length > 0) {
        console.log(`# Undefined Repositories:`);
        console.log(`${output.undefinedRepoList.join('\n')}\n`);
      }
      console.log(`\n## Contributors details`);
      console.log(
        `${JSON.stringify(
          Array.from(resultMap.contributorsDetails.entries()),
          null,
          4,
        )}`,
      );
    }
    if (output.repoCount > 0) {
      console.log(`\n${chalk.yellowBright('#### Summary')}`);
      console.log(
        `${chalk.blueBright(
          '** This summary indicates the number of contributors who have made at least one commit in the last 90 days to repositories **\n',
        )}`,
      );
      console.log(
        `Private Repos Contributors Count: ${privateReposContributors.length}`,
      );
      console.log(
        `Public Repos Contributors Count: ${publicReposContributors.length}`,
      );
      if (output.undefinedRepoList.length > 0) {
        console.log(
          `Undefined Repos Contributors Count: ${undefinedReposContributors.length}`,
        );
      }
      console.log(
        `Total Unique Contributors Count for Private and Public repositories: ${output.contributorsCount}`,
      );
      console.log(`Private Repository Count: ${output.privateRepoList.length}`);
      console.log(`Public Repository Count: ${output.publicRepoList.length}`);
      if (output.undefinedRepoList.length > 0) {
        console.log(
          `Undefined Repository Count: ${output.undefinedRepoList.length}`,
        );
      }
      console.log(`Total Repository Count: ${output.repoCount}`);
      console.log(`Exclusion Count: ${output.exclusionCount}`);
    }
  }
  if (fileOutputPath != '' && fileOutputPath != undefined) {
    try {
      fs.writeFileSync(
        `${fileOutputPath}consolidated-results.json`,
        JSON.stringify(output, null, 4),
      );
      console.log(
        `Consolidated results were written to ${fileOutputPath}consolidated-results.json`,
      );
    } catch (err) {
      console.log(err);
    }
  }
};
