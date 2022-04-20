import * as debugLib from 'debug';
import {
  GithubEnterpriseTarget,
  ContributorMap,
  Integration,
} from '../lib/types';
import { SCMHandlerClass } from '../lib/common/SCMHandler';
import { SourceType } from '../lib/snyk';
import { fetchGithubEnterpriseContributors } from '../lib/github-enterprise/github-enterprise-contributors';

const debug = debugLib('snyk:github-enterprise-count');
const d = new Date();
d.setDate(d.getDate() - 90);
export const threeMonthsDate = `${d.getUTCFullYear()}-${
  d.getMonth() + 1
}-${d.getUTCDate()}T${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}Z`;

export const command = ['github-enterprise'];
export const desc = 'Count contributors for Github enterprise.\n';

export const builder = {
  // options like
  url: {
    required: true,
    default: undefined,
    desc: 'Github enterprise host url. e.g https://ghe.dev.company.org/',
  },
  token: {
    required: true,
    default: undefined,
    desc: 'Github enterprise token',
  },
  orgs: {
    required: false,
    default: undefined,
    desc: '[Optional] A list of your Github enterprise organizations to count contributors for, seperated by comma\n',
  },
  repo: {
    required: false,
    default: undefined,
    desc: '[Optional] A single Github enterprise repo to count contributors for.\n',
  },
  fetchAllOrgs: {
    required: false,
    desc: '[Optional] When enabaled, fetches all the orgs the token has access to rather than fetching only orgs that your authorization allows you to operate on in some way (e.g., you can list teams with read:org scope)\n',
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

class GithubEnterprise extends SCMHandlerClass {
  githubEnterpriseConnInfo: GithubEnterpriseTarget;
  constructor(githubEnterpriseInfo: GithubEnterpriseTarget) {
    super();
    this.githubEnterpriseConnInfo = githubEnterpriseInfo;
  }

  async fetchSCMContributors(
    integrations: Integration[],
  ): Promise<ContributorMap> {
    let contributors: ContributorMap = new Map();
    try {
      debug(
        'ℹ️  Options: ' +
          JSON.stringify(
            `Url: ${this.githubEnterpriseConnInfo.url}, Orgs: ${this.githubEnterpriseConnInfo.orgs}, Repo: ${this.githubEnterpriseConnInfo.repo}, FetchAllOrgs: ${this.githubEnterpriseConnInfo.fetchAllOrgs}`,
          ),
      );
      contributors = await fetchGithubEnterpriseContributors(
        this.githubEnterpriseConnInfo,
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
  url: string;
  token: string;
  orgs?: string;
  repo?: string;
  fetchAllOrgs: boolean;
  exclusionFilePath: string;
  json: boolean;
}): Promise<void> {
  if (process.env.DEBUG) {
    debug('DEBUG MODE ENABLED \n');
    debug(
      'ℹ️  Options: ' +
        JSON.stringify(`Url: ${argv.url} , 
    Org: ${argv.orgs} ,
    Repo: ${argv.repo} , 
    skipSnykMonitoredRepos: FetchAllOrgs: ${argv.fetchAllOrgs}, ExclusionFile: ${argv.exclusionFilePath}`),
    );
  }

  const scmTarget: GithubEnterpriseTarget = {
    url: argv.url.endsWith('/') ? argv.url.slice(0, -1) : argv.url,
    token: argv.token,
    orgs: argv.orgs?.toString().split(','),
    repo: argv.repo,
    fetchAllOrgs: argv.fetchAllOrgs,
  };

  const githubEnterpriseTask = new GithubEnterprise(scmTarget);

  await githubEnterpriseTask.scmContributorCount(
    argv.url,
    SourceType['github-enterprise'],
    argv.exclusionFilePath,
    argv.json,
  );
}
