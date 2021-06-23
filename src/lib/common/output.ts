import * as debugLib from "debug";
import { ContributorMapWithSummary, Output } from "../types";
import * as chalk from 'chalk'


const debug = debugLib("snyk:count-output");

export const printOutResults = (
  resultMap: ContributorMapWithSummary,
  isJsonOutput = false
): void => {
  debug(resultMap);
  let output: Output = {
    contributorsCount: resultMap.contributorsCount,
    repoCount: resultMap.repoCount,
    repoList: resultMap.repoList,
    exclusionCount: resultMap.exclusionCount,
    contributorsDetails: Array.from(resultMap.contributorsDetails.entries()),
  };
  if (isJsonOutput) {
    console.log(JSON.stringify(output, null, 4));
  } else {
    console.log(`\n${chalk.yellowBright('#### Summary')}`);
    console.log(`Contributors Count: ${output.contributorsCount}`);
    console.log(`Repository Count: ${output.repoCount}`);
    console.log(`Exclusion Count: ${output.exclusionCount}`);
    if (output.contributorsCount > 0) {
      console.log(`\n\n${chalk.yellowBright('### Details:')}`);
      console.log(`## Repository List`);
      console.log(`${output.repoList.join("\n")}`);
      console.log(`\n## Contributors details`);
      console.log(`${JSON.stringify(Array.from(resultMap.contributorsDetails.entries()), null, 4)}`);
    }
  }
};
