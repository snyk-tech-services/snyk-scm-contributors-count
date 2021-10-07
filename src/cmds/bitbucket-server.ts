import * as debugLib from 'debug';
import { BitbucketServerTarget, ContributorMap } from '../lib/types';
import { fetchBitbucketContributors } from '../lib/bitbucket-server/bitbucket-server-contributors';
import { SCMHandlerClass } from '../lib/common/SCMHandler';
import { SourceType } from '../lib/snyk';

const debug = debugLib('snyk:bitbucket-server-count');

export const command = ['bitbucket-server'];
export const desc = 'Count contributors for bitbucket-server.\n';

export const builder = {
  token: { required: true, default: undefined, desc: 'Bitbucket server token' },
  url: {
    required: true,
    default: undefined,
    desc: 'Bitbucket server base url (https://bitbucket.mycompany.com)',
  },
  projectKeys: {
    required: false,
    default: undefined,
    desc: 'Bitbucket server project key to count contributors for',
  },
  repo: {
    required: false,
    default: undefined,
    desc: '[Optional] Specific repo to count only for',
  },
  exclusionFilePath: {
    required: false,
    default: undefined,
    desc: '[Optional] Exclusion list filepath',
  },
  json: {
    required: false,
    desc: '[Optional] JSON output',
  },
  skipSnykMonitoredRepos: {
    required: false,
    desc: '[Optional] Skip Snyk monitored repos and count contributors for all repos',
  },
};

class BitbucketServer extends SCMHandlerClass {
  bitbucketConnInfo: BitbucketServerTarget;
  constructor(bitbucketInfo: BitbucketServerTarget) {
    super();
    this.bitbucketConnInfo = bitbucketInfo;
  }

  async fetchSCMContributors(
    SnykMonitoredRepos: string[],
  ): Promise<ContributorMap> {
    let contributors: ContributorMap = new Map();
    try {
      debug('ℹ️  Options: ' + JSON.stringify(this.bitbucketConnInfo));
      contributors = await fetchBitbucketContributors(
        this.bitbucketConnInfo,
        SnykMonitoredRepos,
      );
      return contributors;
    } catch (e) {
      debug('Failed \n' + e);
      console.error(`ERROR! ${e}`);
    }
    return contributors;
  }
}

export async function handler(argv: {
  token: string;
  url: string;
  projectKeys?: string;
  repo?: string;
  exclusionFilePath: string;
  json: boolean;
  skipSnykMonitoredRepos: boolean;
}): Promise<void> {
  if (process.env.DEBUG) {
    debug('DEBUG MODE ENABLED \n');
    debug('ℹ️  Options: ' + JSON.stringify(argv));
  }

  const scmTarget: BitbucketServerTarget = {
    token: argv.token,
    url: argv.url,
    projectKeys: argv.projectKeys?.toString().split(','),
    repo: argv.repo,
  };

  const bitbucketServerTask = new BitbucketServer(scmTarget);

  await bitbucketServerTask.scmContributorCount(
    argv.url,
    SourceType['bitbucket-server'],
    argv.skipSnykMonitoredRepos,
    argv.exclusionFilePath,
    argv.json,
  );
}
