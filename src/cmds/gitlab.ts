import * as debugLib from 'debug';
import { GitlabTarget, ContributorMap } from '../lib/types';
import { SCMHandlerClass } from '../lib/common/SCMHandler';
import { SourceType } from '../lib/snyk';
import { fetchGitlabContributors } from '../lib/gitlab/gitlab-contributors';

const debug = debugLib('snyk:gitlab-count');

const d = new Date();
d.setDate(d.getDate() - 90);
d.setMonth(d.getMonth() + 1);
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
  url: {
    required: false,
    default: 'https://gitlab.com/',
    desc: '[Optional] Your Gitlab host URL e.g. https://gitlab.dev.YourCompany/\n',
  },
  groups: {
    required: false,
    default: undefined,
    desc: '[Optional] Gitlab groups (lowest level where applicabale)names, seperated by commas, to count contributors for.\n e.g snyk-group or snyk-subGroup',
  },
  project: {
    required: false,
    default: undefined,
    desc: '[Optional] Gitlab project path with namespace to count contributors for.\n e.g snyk-test-group/goof-project',
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
    desc: '[Optional] Skip Snyk monitored projects and count contributors for all projects',
  },
};

class Gitlab extends SCMHandlerClass {
  gitlabConnInfo: GitlabTarget;
  constructor(gitlabInfo: GitlabTarget) {
    super();
    this.gitlabConnInfo = gitlabInfo;
  }

  async fetchSCMContributors(
    SnykMonitoredRepos: string[],
  ): Promise<ContributorMap> {
    let contributors: ContributorMap = new Map();
    try {
      debug('ℹ️  Options: ' + JSON.stringify(this.gitlabConnInfo));
      contributors = await fetchGitlabContributors(
        this.gitlabConnInfo,
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
  url: string;
  groups: string[];
  project: string;
  exclusionFilePath: string;
  json: boolean;
  skipSnykMonitoredRepos: boolean;
}): Promise<void> {
  if (process.env.DEBUG) {
    debug('DEBUG MODE ENABLED \n');
    debug('ℹ️  Options: ' + JSON.stringify(argv));
  }

  const scmTarget: GitlabTarget = {
    token: argv.token,
    url: argv.url,
    groups: argv.groups?.toString().split(','),
    project: argv.project,
  };

  const gitlabTask = new Gitlab(scmTarget);

  await gitlabTask.scmContributorCount(
    argv.url,
    SourceType['gitlab'],
    argv.skipSnykMonitoredRepos,
    argv.exclusionFilePath,
    argv.json,
  );
}
