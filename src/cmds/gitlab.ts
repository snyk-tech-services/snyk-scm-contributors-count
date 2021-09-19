import * as debugLib from 'debug';
import { GitlabTarget, ContributorMap } from '../lib/types';
import { SCMHandlerClass } from '../lib/common/SCMHandler';
import { SourceType } from '../lib/snyk';
import { fetchGitlabContributors } from '../lib/gitlab/gitlab-contributors';

const debug = debugLib('snyk:gitlab-count');

const d = new Date();
d.setMonth(d.getMonth() - 2);
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

export const command = ['gitlab'];
export const desc = 'Count contributors for Gitlab.\n';

export const builder = {
  // options like
  token: { required: true, default: undefined, desc: 'Gitlab token' },
  host: {
    required: false,
    default: 'https://gitlab.com/',
    desc: '[Optional] Your Gitlab host URL e.g. https://gitlab.dev.YourCompany/\n',
  },
  projectKeys: {
    required: false,
    default: undefined,
    desc: '[Optional] Gitlab project paths with namespaces or project keys to count contributors for.\n e.g snyk/goof (as path with namespace) or 10224 (as the project ID',
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
};

class Gitlab extends SCMHandlerClass {
  gitlabConnInfo: GitlabTarget;
  constructor(gitlabInfo: GitlabTarget) {
    super();
    this.gitlabConnInfo = gitlabInfo;
  }

  async fetchSCMContributors(): Promise<ContributorMap> {
    let contributors: ContributorMap = new Map();
    try {
      debug('ℹ️  Options: ' + JSON.stringify(this.gitlabConnInfo));
      contributors = await fetchGitlabContributors(
        this.gitlabConnInfo,
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
  host: string;
  projectKeys?: string;
  exclusionFilePath: string;
  json: boolean;
}): Promise<void> {
  if (process.env.DEBUG) {
    debug('DEBUG MODE ENABLED \n');
    debug('ℹ️  Options: ' + JSON.stringify(argv));
  }

  const scmTarget: GitlabTarget = {
    token: argv.token,
    host: argv.host,
    projectKeys: argv.projectKeys?.split(','),
  };

  const gitlabTask = new Gitlab(scmTarget);

  await gitlabTask.scmContributorCount(
    argv.host,
    SourceType['gitlab'],
    true,
    argv.exclusionFilePath,
    argv.json,
  );
}
