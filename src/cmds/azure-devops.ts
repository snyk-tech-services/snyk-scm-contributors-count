import * as debugLib from 'debug';
import { AzureDevopsTarget, ContributorMap } from '../lib/types';
import { SCMHandlerClass } from '../lib/common/SCMHandler';
import { SourceType } from '../lib/snyk';
import { fetchAzureDevopsContributors } from '../lib/azure-devops/azure-devops-contributors';

const debug = debugLib('snyk:azure-devops-count');
const azureDefaultUrl = 'https://dev.azure.com/';

const d = new Date();
d.setDate(d.getDate() - 90);
export const threeMonthsDate =
  d.getFullYear() +
  '/' +
  d.getMonth() +
  '/' +
  d.getDate() +
  ' ' +
  d.getHours() +
  ':' +
  d.getMinutes();

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

class AzureDevops extends SCMHandlerClass {
  azureConnInfo: AzureDevopsTarget;
  constructor(azureInfo: AzureDevopsTarget) {
    super();
    this.azureConnInfo = azureInfo;
  }

  async fetchSCMContributors(
    SnykMonitoredRepos: string[],
  ): Promise<ContributorMap> {
    let contributors: ContributorMap = new Map();
    try {
      debug('ℹ️  Options: ' + JSON.stringify(this.azureConnInfo));
      contributors = await fetchAzureDevopsContributors(
        this.azureConnInfo,
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
  org: string;
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

  const scmTarget: AzureDevopsTarget = {
    token: argv.token,
    OrgName: argv.org,
    projectKeys: argv.projectKeys?.toString().split(','),
    repo: argv.repo,
  };

  const azureDevopsTask = new AzureDevops(scmTarget);

  await azureDevopsTask.scmContributorCount(
    azureDefaultUrl,
    SourceType['azure-repos'],
    argv.skipSnykMonitoredRepos,
    argv.exclusionFilePath,
    argv.json,
  );
}
