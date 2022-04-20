import * as debugLib from 'debug';
import {
  BitbucketServerTarget,
  ContributorMap,
  Integration,
} from '../lib/types';
import { fetchBitbucketContributors } from '../lib/bitbucket-server/bitbucket-server-contributors';
import { SCMHandlerClass } from '../lib/common/SCMHandler';
import { SourceType } from '../lib/snyk';
import { access } from 'fs/promises';
import { constants } from 'fs';

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

class BitbucketServer extends SCMHandlerClass {
  bitbucketConnInfo: BitbucketServerTarget;
  constructor(bitbucketInfo: BitbucketServerTarget) {
    super();
    this.bitbucketConnInfo = bitbucketInfo;
  }

  async fetchSCMContributors(
    integrations: Integration[],
    SnykMonitoredRepos: string[],
    importConfDir: string,
    importFileRepoType: string,
  ): Promise<ContributorMap> {
    let contributors: ContributorMap = new Map();
    try {
      debug(
        'ℹ️  Options: ' +
          JSON.stringify(
            `Url: ${this.bitbucketConnInfo.url}, Project Keys: ${this.bitbucketConnInfo.projectKeys}, Repo :${this.bitbucketConnInfo.repo}`,
          ),
      );
      contributors = await fetchBitbucketContributors(
        this.bitbucketConnInfo,
        SnykMonitoredRepos,
        integrations,
        importConfDir,
        importFileRepoType,
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
  importConfDir: string;
  importFileRepoType: string;
}): Promise<void> {
  if (process.env.DEBUG) {
    debug('DEBUG MODE ENABLED \n');
    debug(
      'ℹ️  Options: ' +
        JSON.stringify(
          `Url: ${argv.url}, Project Keys: ${argv.projectKeys}, Repo: ${argv.repo}, skipSnykMonitoredRepos: ${argv.skipSnykMonitoredRepos}, ExclusionFile: ${argv.exclusionFilePath}, ImportConfDir: ${argv.importConfDir}, ImportFileRepoType: ${argv.importFileRepoType}`,
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

  const scmTarget: BitbucketServerTarget = {
    token: argv.token,
    url: argv.url.endsWith('/') ? argv.url.slice(0, -1) : argv.url,
    projectKeys: argv.projectKeys?.toString().split(','),
    repo: argv.repo,
  };

  const bitbucketServerTask = new BitbucketServer(scmTarget);

  await bitbucketServerTask.scmContributorCount(
    argv.url,
    SourceType['bitbucket-server'],
    argv.exclusionFilePath,
    argv.json,
    argv.skipSnykMonitoredRepos,
    argv.importConfDir,
    argv.importFileRepoType,
  );
}
