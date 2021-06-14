import * as debugLib from "debug";
import { BitbucketServerTarget, ContributorMap } from "../lib/types";
import { fetchBitbucketContributors } from "../lib/bitbucket-server/bitbucket-server-contributors";
import * as ora from "ora";
import { SCMHandlerClass, SCMHandlerInterface } from "../lib/common/SCMHandler";

const debug = debugLib("snyk:bitbucket-server-count");

export const command = ["bitbucket-server"];
export const desc = "Count contributors for bitbucket-server.\n";

export const builder = {
  token: { required: true, default: undefined, desc: "Bitbucket server token" },
  url: {
    required: true,
    default: undefined,
    desc: "Bitbucket server base url (https://bitbucket.mycompany.com)",
  },
  projectKeys: {
    required: false,
    default: undefined,
    desc: "Bitbucket server project key to count contributors for",
  },
  repo: {
    required: false,
    default: undefined,
    desc: "[Optional] Specific repo to count only for",
  },
  exclusionFilePath: {
    required: false,
    default: undefined,
    desc: "[Optional] Exclusion list filepath",
  },
  json: {
    required: false,
    desc: "[Optional] JSON output",
  },
  skipSnykMonitoredRepos: {
      required: false,
      desc: "[Optional] Skip Snyk monitored repos and count contributors for all repos"
  }
};

export class BitbucketServer
  extends SCMHandlerClass
  implements SCMHandlerInterface
{
  bitbucketConnInfo: BitbucketServerTarget;
  constructor(bitbucketInfo: BitbucketServerTarget) {
    super();
    this.bitbucketConnInfo = bitbucketInfo;
  }

  async fetchSCMContributors(SnykMonitoredRepos: string[]) {
    let contributors: ContributorMap = new Map();
    try {
      debug("ℹ️  Options: " + JSON.stringify(this.bitbucketConnInfo));
      contributors = await fetchBitbucketContributors(
        this.bitbucketConnInfo,
        SnykMonitoredRepos
      );
    } catch (e) {
      debug("Failed \n" + e);
      console.error(`ERROR! ${e}`);
    } finally {
      return contributors;
    }
  }
}

export async function handler(argv: {
  token: string;
  url: string;
  projectKeys?: string;
  repo?: string;
  exclusionFilePath?: string;
  json: boolean;
  skipSnykMonitoredRepos: boolean
}): Promise<void> {
  let isQuiet = false;
  if (process.env.DEBUG) {
    debug("DEBUG MODE ENABLED \n");
    debug("ℹ️  Options: " + JSON.stringify(argv));
    isQuiet = true;
  } else if (argv.json) {
    isQuiet = true;
  }

  const spinner = ora({ isSilent: isQuiet });
  debug("Loading snyk monitored repos list \n");
  // TODO: Add option to set this to empty array when we want to count irrespective of what's in snyk

  const scmTarget: BitbucketServerTarget = {
    token: argv.token,
    url: argv.url,
    projectKeys: argv.projectKeys?.split(","),
    repo: argv.repo,
  };
  spinner.start();
  spinner.text = "Loading snyk monitored repos list";
  let bitbucketServerTask = new BitbucketServer(scmTarget);
  let snykImportedRepos: string[] = []
  if(!argv.skipSnykMonitoredRepos){    
    snykImportedRepos = await bitbucketServerTask.retrieveMonitoredRepos(
        argv.url,
        bitbucketServerTask.SourceType["bitbucket-server"]
      );
      spinner.succeed();
      
      spinner.start();
      spinner.text = "Removing monitored repository duplicates";
      debug("Removing monitored repository duplicates");
      const deduppedSnykImportedRepos =
        bitbucketServerTask.dedupRepos(snykImportedRepos);
      debug(deduppedSnykImportedRepos);
      spinner.succeed();
  }

  spinner.start();
  debug("Retrieving projects from Bitbucket server \n");
  spinner.text =
    "Retrieving projects from Bitbucket server with commits in last 90 days";
  let contributors = await bitbucketServerTask.fetchSCMContributors(
    snykImportedRepos
  );
  spinner.succeed();

  

  spinner.start();
  spinner.text = "Removing duplicate contributors";
  debug("Contributors before exclusion");
  contributors = bitbucketServerTask.dedupContributorsByEmail(contributors);
  const contributorsCountBeforeExclusion = contributors.size;
  debug(contributors);
  spinner.succeed();

  if (argv.exclusionFilePath) {
    spinner.start();
    spinner.text = "Applying exclusion list ";
    contributors = bitbucketServerTask.excludeFromListByEmail(
      contributors,
      argv.exclusionFilePath
    );
    debug("Contributors after exclusion list");
    debug(contributors);
    spinner.succeed();
  }

  const contributorsCountAfterExclusion = contributors.size;
  const outputResults = bitbucketServerTask.calculateSummaryStats(
    contributors,
    contributorsCountBeforeExclusion - contributorsCountAfterExclusion
  );
  debug("Output results");
  debug(outputResults);
  bitbucketServerTask.printOutResults(outputResults);

  // TODO:
  // - calculate summary stats
  // - build json output
  // - build display function
}
