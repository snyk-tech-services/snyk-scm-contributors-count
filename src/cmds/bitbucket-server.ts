import * as debugLib from "debug";
import { BitbucketServerTarget, ContributorMap } from "../lib/types";
import { fetchBitbucketContributors } from "../lib/bitbucket-server/bitbucket-server-contributors";
import { retrieveMonitoredRepos, SourceType } from '../lib/snyk'
import * as ora from 'ora';
import { SCMHandlerClass, SCMHandlerInterface } from '../lib/common/SCMHandler'

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
};

export class BitbucketServer extends SCMHandlerClass implements SCMHandlerInterface {
  bitbucketConnInfo: BitbucketServerTarget;
  constructor(bitbucketInfo: BitbucketServerTarget) {
      super()
    this.bitbucketConnInfo = bitbucketInfo;
  }

  
  async fetchSCMContributors(SnykMonitoredRepos:string[]) {

    let contributors: ContributorMap = new Map()
    try {
      debug("ℹ️  Options: " + JSON.stringify(this.bitbucketConnInfo));
      contributors = await fetchBitbucketContributors(this.bitbucketConnInfo, SnykMonitoredRepos)

    } catch (e) {
      debug("Failed \n" + e);
      console.error(`ERROR! ${e}`);
    } finally {
        return contributors
    }
  }
}

export async function handler(argv: {
  token: string;
  url: string;
  projectKeys?: string;
  repo?: string;
  exclusionFilePath?: string;
}): Promise<void> {
    const spinner = ora('Loading snyk monitored repos list');
    
    if(process.env.DEBUG){
        debug("DEBUG MODE ENABLED \n");    
        spinner.stop()
    } else {
        spinner.start()
    }

    debug("Loading snyk monitored repos list \n");
    // TODO: Add option to set this to empty array when we want to count irrespective of what's in snyk
    const snykImportedRepos = await retrieveMonitoredRepos(argv.url, SourceType["bitbucket-server"])
    spinner.succeed()
    const scmTarget:BitbucketServerTarget = {
        token:argv.token,
        url: argv.url,
        projectKeys: argv.projectKeys?.split(','),
        repo: argv.repo
    }
  let bitbucketServerTask = new BitbucketServer(scmTarget);
  debug("Retrieving projects from Bitbucket server \n");
  spinner.text = 'Retrieving projects from Bitbucket server with commits in last 90 days';
  const contributors = await bitbucketServerTask.fetchSCMContributors(snykImportedRepos);
  spinner.succeed()

  debug('Repos in Snyk')
  const deduppedSnykImportedRepos = bitbucketServerTask.dedupRepos(snykImportedRepos)
  debug(deduppedSnykImportedRepos)
  debug('Contributors before exclusion')
  const deduppedContributors = bitbucketServerTask.dedupContributorsByEmail(contributors)
  debug(deduppedContributors)

  const contributorsList = bitbucketServerTask.excludeFromListByEmail(deduppedContributors,argv.exclusionFilePath)
  debug('Contributors after exclusion list')
  debug(contributorsList)

  // TODO:
  // - calculate summary stats
  // - build json output
  // - build display function

}
