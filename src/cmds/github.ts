import * as debugLib from 'debug';
import { GithubTarget, ContributorMap } from '../lib/types';
import { SCMHandlerClass } from '../lib/common/SCMHandler';
import { SourceType } from '../lib/snyk';
import { fetchGithubContributors } from '../lib/github/github-contributors';

const debug = debugLib('snyk:github-count');
const githubDefaultUrl = 'https://github.com/';
const d = new Date();
d.setDate(d.getDate() - 90);
export const threeMonthsDate =
  d.getFullYear() +
  '-' +
  d.getMonth() +
  '-' +
  d.getDate() +
  'T' +
  d.getHours() +
  ':' +
  d.getMinutes() +
  ':' +
  d.getSeconds() +
  'Z';

export const command = ['github'];
export const desc = 'Count contributors for Github.\n';

export const builder = {
  // options like
  token: { required: true, default: undefined, desc: 'Github token' },
  orgs: {
    required: false,
    default: undefined,
    desc: 'A list of your Github organizations to count contributors for, seperated by comma\n',
  },
  repo: {
    required: false,
    default: undefined,
    desc: '[Optional] A single Github repo to count contributors for.\n',
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

class Github extends SCMHandlerClass {
  githubConnInfo: GithubTarget;
  constructor(githubInfo: GithubTarget) {
    super();
    this.githubConnInfo = githubInfo;
  }

  async fetchSCMContributors(
    SnykMonitoredRepos: string[],
  ): Promise<ContributorMap> {
    let contributors: ContributorMap = new Map();
    try {
      debug('ℹ️  Options: ' + JSON.stringify(this.githubConnInfo));
      contributors = await fetchGithubContributors(
        this.githubConnInfo,
        SnykMonitoredRepos,
        threeMonthsDate,
      );
    } catch (e) {
      debug('Failed \n' + e);
      console.error(`ERROR! ${e}`);
    }
    return contributors;
  }
}

export async function handler(argv: {
  token: string;
  orgs?: string;
  repo?: string;
  exclusionFilePath: string;
  json: boolean;
  skipSnykMonitoredRepos: boolean;
}): Promise<void> {
  if (process.env.DEBUG) {
    debug('DEBUG MODE ENABLED \n');
    debug('ℹ️  Options: ' + JSON.stringify(argv));
  }

  const scmTarget: GithubTarget = {
    token: argv.token,
    orgs: argv.orgs?.toString().split(','),
    repo: argv.repo,
  };

  const githubTask = new Github(scmTarget);

  await githubTask.scmContributorCount(
    githubDefaultUrl,
    SourceType['github'],
    argv.skipSnykMonitoredRepos,
    argv.exclusionFilePath,
    argv.json,
  );
}
