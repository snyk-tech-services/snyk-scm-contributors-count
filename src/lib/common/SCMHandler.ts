import * as ora from 'ora';
import {
  dedupRepos,
  dedupContributorsByEmail,
  excludeFromListByEmail,
  calculateSummaryStats,
  printOutResults,
} from '.';
import { ContributorMap, Integration } from '../types';
import {
  retrieveMonitoredRepos,
  SourceType,
  retrieveOrgsAndIntegrations,
} from '../snyk';
import * as debugLib from 'debug';

const debug = debugLib('snyk:scm-handler');

export abstract class SCMHandlerClass {
  dedupRepos = dedupRepos;
  dedupContributorsByEmail = dedupContributorsByEmail;
  excludeFromListByEmail = excludeFromListByEmail;
  retrieveMonitoredRepos = retrieveMonitoredRepos;
  calculateSummaryStats = calculateSummaryStats;
  printOutResults = printOutResults;
  SourceType = SourceType;

  abstract fetchSCMContributors(
    snykMonitoredRepos?: string[],
    integrations?: Integration[],
    importConfDir?: string,
    importFileRepoType?: string,
  ): Promise<ContributorMap>;

  scmContributorCount = async (
    url: string,
    sourceType: SourceType,
    skipSnykMonitoredRepos: boolean,
    importConfDir: string,
    importFileRepoType: string,
    exclusionFilePath: string,
    json: boolean,
  ): Promise<void> => {
    let isQuiet = false;
    let integrations: Integration[] = [];
    if (process.env.DEBUG) {
      debug('DEBUG MODE ENABLED \n');
      isQuiet = true;
    } else if (json) {
      isQuiet = true;
    }

    const spinner = ora({ isSilent: isQuiet });
    if (!skipSnykMonitoredRepos) {
      debug('Loading snyk monitored repos list \n');
    }
    // TODO: Add option to set this to empty array when we want to count irrespective of what's in snyk
    if (!process.env.SNYK_TOKEN && !skipSnykMonitoredRepos) {
      throw new Error(
        'SNYK_TOKEN must be exported before running the script without the skipSnykMonitoredFlag set',
      );
      return;
    }
    spinner.start();
    if (importConfDir && process.env.SNYK_TOKEN) {
      debug('Retrieving Org and Integration data');
      integrations = await retrieveOrgsAndIntegrations();
    } else if (importConfDir && !process.env.SNYK_TOKEN) {
      debug(
        'Snyk token was not provided, continuing without fetching integration data from Snyk ',
      );
    }
    if (!skipSnykMonitoredRepos) {
      spinner.text = 'Loading snyk monitored repos list';
    }
    let snykImportedRepos: string[] = [];

    if (!skipSnykMonitoredRepos) {
      const parsedUrl: string[] = url.split(',');
      for (let i = 0; i < parsedUrl.length; i++) {
        snykImportedRepos = snykImportedRepos.concat(
          await this.retrieveMonitoredRepos(parsedUrl[i], sourceType),
        ); //(url, sourceType);
      }
      spinner.succeed();

      spinner.start();
      spinner.text = 'Removing monitored repository duplicates';
      debug('Removing monitored repository duplicates');
      snykImportedRepos = this.dedupRepos(snykImportedRepos);
      debug(snykImportedRepos);
      spinner.succeed();
    }
    spinner.start();
    debug('Retrieving projects/orgs from the SCM \n');
    spinner.text =
      'Retrieving projects/orgs from the SCM with commits in last 90 days';

    let contributors = (await this.fetchSCMContributors(
      snykImportedRepos,
      integrations,
      importConfDir,
      importFileRepoType,
    )) as ContributorMap;
    spinner.succeed();

    spinner.start();
    spinner.text = 'Removing duplicate contributors';
    debug('Contributors before exclusion');
    contributors = this.dedupContributorsByEmail(contributors);
    const contributorsCountBeforeExclusion = contributors.size;
    debug(contributors);
    spinner.succeed();

    if (exclusionFilePath) {
      spinner.start();
      spinner.text = 'Applying exclusion list ';
      contributors = this.excludeFromListByEmail(
        contributors,
        exclusionFilePath,
      );
      debug('Contributors after exclusion list');
      debug(contributors);
      spinner.succeed();
    }

    const contributorsCountAfterExclusion = contributors.size;
    const outputResults = this.calculateSummaryStats(
      contributors,
      contributorsCountBeforeExclusion - contributorsCountAfterExclusion,
    );
    debug('Output results');
    debug(outputResults);
    this.printOutResults(outputResults, json);
  };
}
