import * as debugLib from 'debug';
import { GitlabTarget, ContributorMap, Integration } from '../lib/types';
import { SCMHandlerClass } from '../lib/common/SCMHandler';
import { SourceType } from '../lib/snyk';
import { fetchGitlabContributors } from '../lib/gitlab/gitlab-contributors';
import { access } from 'fs/promises';
import { constants } from 'fs';

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
  importConfDir: {
    required: false,
    desc: '[Optional] A path to a valid folder for the generated import files',
  },
  importFileRepoType: {
    required: false,
    default: '',
    desc: '[Optional] Specify the type of repos to be added to the import file. Options: all/private/public. Default: all',
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
    integrations: Integration[],
    importConfDir: string,
    importFileRepoType: string,
  ): Promise<ContributorMap> {
    let contributors: ContributorMap = new Map();
    try {
      debug(
        'ℹ️  Options: ' +
          JSON.stringify(
            `Url: ${this.gitlabConnInfo.url}, Groups: ${this.gitlabConnInfo.groups}, Project: ${this.gitlabConnInfo.project}`,
          ),
      );
      contributors = await fetchGitlabContributors(
        this.gitlabConnInfo,
        SnykMonitoredRepos,
        integrations,
        importConfDir,
        importFileRepoType,
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
  importConfDir: string;
  importFileRepoType: string;
}): Promise<void> {
  if (process.env.DEBUG) {
    debug('DEBUG MODE ENABLED \n');
    debug(
      'ℹ️  Options: ' +
        JSON.stringify(
          `Url: ${argv.url}, Groups: ${argv.groups}, Project: ${argv.project}, skipSnykMonitoredRepos: ${argv.skipSnykMonitoredRepos}, ExclusionFile: ${argv.exclusionFilePath}, ImportConfDir: ${argv.importConfDir}, ImportFileRepoType: ${argv.importFileRepoType}`,
        ),
    );
  }
  if (argv.importConfDir) {
    try {
      await access(argv.importConfDir, constants.W_OK);
    } catch {
      console.error(
        `Cannot access ${argv.importConfDir} for writing, please restart and provide a valid path`,
      );
      process.exit(1);
    }
  }
  if (argv.importConfDir && argv.project) {
    console.log(
      'Triggering the importConfDir flag cannot be done for a single repo. Please remove the flag from the command or run without the project flag',
    );
    process.exit(1);
  }
  if (argv.importFileRepoType != '' && !argv.importConfDir) {
    console.log(
      'The importFileRepoType flag was set without the importConfDir flag, please restart and pass the importConfDir or remove the importFileRepoType flag',
    );
    process.exit(1);
  }
  const scmTarget: GitlabTarget = {
    token: argv.token,
    url: argv.url.endsWith('/') ? argv.url.slice(0, -1) : argv.url,
    groups: argv.groups?.toString().split(','),
    project: argv.project,
  };

  const gitlabTask = new Gitlab(scmTarget);

  await gitlabTask.scmContributorCount(
    argv.url,
    SourceType['gitlab'],
    argv.skipSnykMonitoredRepos,
    argv.importConfDir,
    argv.importFileRepoType,
    argv.exclusionFilePath,
    argv.json,
  );
}
