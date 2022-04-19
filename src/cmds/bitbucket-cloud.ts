import * as debugLib from 'debug';
import {
  BitbucketCloudTarget,
  ContributorMap,
  Integration,
} from '../lib/types';
import { fetchBitbucketCloudContributors } from '../lib/bitbucket-cloud/bitbucket-cloud-contributors';
import { SCMHandlerClass } from '../lib/common/SCMHandler';
import { SourceType } from '../lib/snyk';
import { access } from 'fs/promises';
import { constants } from 'fs';

const debug = debugLib('snyk:bitbucket-cloud-count');
const bitbucketCloudDefaultUrl = 'https://bitbucket.org/';
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

class BitbucketCloud extends SCMHandlerClass {
  bitbucketCloudConnInfo: BitbucketCloudTarget;
  constructor(bitbucketCloudInfo: BitbucketCloudTarget) {
    super();
    this.bitbucketCloudConnInfo = bitbucketCloudInfo;
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
            `Workspaves: ${this.bitbucketCloudConnInfo.workspaces}, Repo :${this.bitbucketCloudConnInfo.repo}`,
          ),
      );
      contributors = await fetchBitbucketCloudContributors(
        this.bitbucketCloudConnInfo,
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
  user: string;
  password: string;
  workspaces?: string;
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
          `Workscapes: ${argv.workspaces}, Repo: ${argv.repo}, skipSnykMonitoredRepos: ${argv.skipSnykMonitoredRepos}, ExclusionFile: ${argv.exclusionFilePath}, ImportConfDir: ${argv.importConfDir}, ImportFileRepoType: ${argv.importFileRepoType}`,
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
  const scmTarget: BitbucketCloudTarget = {
    user: argv.user,
    password: argv.password,
    workspaces: argv.workspaces?.toString().split(','),
    repo: argv.repo,
  };

  const bitbucketCloudTask = new BitbucketCloud(scmTarget);

  await bitbucketCloudTask.scmContributorCount(
    bitbucketCloudDefaultUrl,
    SourceType['bitbucket-cloud'],
    argv.exclusionFilePath,
    argv.json,
    argv.skipSnykMonitoredRepos,
    argv.importConfDir,
    argv.importFileRepoType,
  );
}
