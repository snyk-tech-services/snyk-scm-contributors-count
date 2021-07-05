import * as debugLib from 'debug';
import { BitbucketCloudTarget, ContributorMap } from '../lib/types';
import { fetchBitbucketCloudContributors } from '../lib/bitbucket-cloud/bitbucket-cloud-contributors';
import { SCMHandlerClass } from '../lib/common/SCMHandler';
import { SourceType } from '../lib/snyk';

const debug = debugLib('snyk:bitbucket-cloud-count');
const bitbucketCLoudDefaultUrl = 'https://bitbucket.org/';
export const command = ['bitbucket-cloud'];
export const desc = 'Count contributors for bitbucket-cloud.\n';

export const builder = {
  user: {
    required: true,
    default: undefined,
    desc: 'Bitbucket cloud username',
  },
  password: {
    required: true,
    default: undefined,
    desc: 'Bitbucket cloud password',
  },
  workspaces: {
    required: false,
    default: undefined,
    desc: 'Bitbucket cloud workspace name/uuid to count contributors for',
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

class BitbucketCloud extends SCMHandlerClass {
  bitbucketCloudConnInfo: BitbucketCloudTarget;
  constructor(bitbucketCloudInfo: BitbucketCloudTarget) {
    super();
    this.bitbucketCloudConnInfo = bitbucketCloudInfo;
  }

  async fetchSCMContributors(
    SnykMonitoredRepos: string[],
  ): Promise<ContributorMap> {
    let contributors: ContributorMap = new Map();
    try {
      debug('ℹ️  Options: ' + JSON.stringify(this.bitbucketCloudConnInfo));
      contributors = await fetchBitbucketCloudContributors(
        this.bitbucketCloudConnInfo,
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
  user: string;
  password: string;
  workspaces?: string;
  repo?: string;
  exclusionFilePath: string;
  json: boolean;
  skipSnykMonitoredRepos: boolean;
}): Promise<void> {
  if (process.env.DEBUG) {
    debug('DEBUG MODE ENABLED \n');
    debug('ℹ️  Options: ' + JSON.stringify(argv));
  }

  const scmTarget: BitbucketCloudTarget = {
    user: argv.user,
    password: argv.password,
    workspaces: argv.workspaces?.split(','),
    repo: argv.repo,
  };

  const bitbucketCloudTask = new BitbucketCloud(scmTarget);

  await bitbucketCloudTask.scmContributorCount(
    bitbucketCLoudDefaultUrl,
    SourceType['bitbucket-cloud'],
    argv.skipSnykMonitoredRepos,
    argv.exclusionFilePath,
    argv.json,
  );
}
