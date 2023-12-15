import * as debugLib from 'debug';
import { AzureDevopsTarget, ContributorMap, Integration } from '../lib/types';
import { SCMHandlerClass } from '../lib/common/SCMHandler';
import { SourceType } from '../lib/snyk';
import { fetchAzureDevopsContributors } from '../lib/azure-devops/azure-devops-contributors';
import { access } from 'fs/promises';
import { constants } from 'fs';

const debug = debugLib('snyk:azure-devops-count');
const azureDefaultUrls = 'https://dev.azure.com,https://visualstudio.com';

const d = new Date();
d.setDate(d.getDate() - 90);
export const threeMonthsDate = `${d.getUTCFullYear()}/${
  d.getMonth() + 1
}/${d.getUTCDate()} ${d.getHours()}:${d.getMinutes()}`;

export const command = ['azure-devops'];
export const desc = 'Count contributors for azure-devops.\n';

export const builder = {
  // options like
  token: { required: true, default: undefined, desc: 'Azure Devops token' },
  org: {
    required: true,
    default: undefined,
    desc: 'Your Org name in Azure Devops e.g. https://dev.azure.com/{OrgName}',
  },
  projectKeys: {
    required: false,
    default: undefined,
    desc: '[Optional] Azure Devops project key/name to count contributors for',
  },
  repo: {
    required: false,
    default: undefined,
    desc: '[Optional] Specific repo to count only for',
  },
  exclusionFilePath: {
    required: false,
    default: undefined,
    desc: '[Optional] Exclusion list filepath ',
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

class AzureDevops extends SCMHandlerClass {
  azureConnInfo: AzureDevopsTarget;
  constructor(azureInfo: AzureDevopsTarget) {
    super();
    this.azureConnInfo = azureInfo;
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
            `Org name: ${this.azureConnInfo.OrgName}, Project Key: ${this.azureConnInfo.projectKeys}, Repo: ${this.azureConnInfo.repo}`,
          ),
      );
      contributors = await fetchAzureDevopsContributors(
        this.azureConnInfo,
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
  org: string;
  projectKeys?: string;
  repo?: string;
  exclusionFilePath: string;
  json: boolean;
  skipSnykMonitoredRepos: boolean;
  importConfDir: string;
  importFileRepoType: string;
  azureUrls: string;
}): Promise<void> {
  if (process.env.DEBUG) {
    debug('DEBUG MODE ENABLED \n');
    debug(
      'ℹ️  Options: ' +
        JSON.stringify(
          `Org name: ${argv.org}, Project Keys: ${argv.projectKeys}, Repo: ${argv.repo}, skipSnykMonitoredRepos: ${argv.skipSnykMonitoredRepos}, ExclusionFile: ${argv.exclusionFilePath}, ImportConfDir: ${argv.importConfDir}, ImportFileRepoType: ${argv.importFileRepoType}`,
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
  const scmTarget: AzureDevopsTarget = {
    token: argv.token,
    OrgName: argv.org,
    projectKeys: argv.projectKeys?.toString().split(','),
    repo: argv.repo,
  };

  const azureDevopsTask = new AzureDevops(scmTarget);

  await azureDevopsTask.scmContributorCount(
    argv.azureUrls || azureDefaultUrls,
    SourceType['azure-repos'],
    argv.exclusionFilePath,
    argv.json,
    argv.skipSnykMonitoredRepos,
    argv.importConfDir,
    argv.importFileRepoType,
  );
}
