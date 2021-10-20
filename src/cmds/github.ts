import * as debugLib from 'debug';
import { GithubTarget, ContributorMap, Integration } from '../lib/types';
import { SCMHandlerClass } from '../lib/common/SCMHandler';
import { SourceType } from '../lib/snyk';
import { fetchGithubContributors } from '../lib/github/github-contributors';
import { access } from 'fs/promises';
import { constants } from 'fs';

const debug = debugLib('snyk:github-count');
const githubDefaultUrl = 'https://github.com/';

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

class Github extends SCMHandlerClass {
  githubConnInfo: GithubTarget;
  constructor(githubInfo: GithubTarget) {
    super();
    this.githubConnInfo = githubInfo;
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
            `Orgs: ${this.githubConnInfo.orgs}, Repo: ${this.githubConnInfo.repo}`,
          ),
      );
      contributors = await fetchGithubContributors(
        this.githubConnInfo,
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
  orgs?: string;
  repo?: string;
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
          `Orgs: ${argv.orgs}, Repo: ${argv.repo}, SkipSNykMonitoredRepos: ${argv.skipSnykMonitoredRepos}, Exclusion File: ${argv.exclusionFilePath}, ImportConfDir: ${argv.importConfDir}, ImportFileRepoType: ${argv.importFileRepoType}`,
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
  if (argv.importConfDir && argv.repo) {
    console.log(
      'Triggering the importConfDir flag cannot be done for a single repo. Please remove the flag from the command or run without the repo flag',
    );
    process.exit(1);
  }
  if (argv.importFileRepoType != '' && !argv.importConfDir) {
    console.log(
      'The importFileRepoType flag was set without the importConfDir flag, please restart and pass the importConfDir or remove the importFileRepoType flag',
    );
    process.exit(1);
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
    argv.importConfDir,
    argv.importFileRepoType,
    argv.exclusionFilePath,
    argv.json,
  );
}
