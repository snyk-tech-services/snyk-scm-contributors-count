import { IntegrationsGetResponseType } from 'snyk-api-ts-client/dist/client/generated/org';

export type ContributorMap = Map<Username, Contributor>;

export type Username = string;

export interface Contributor {
  email: string;
  alternateEmails?: string[];
  contributionsCount: number;
  reposContributedTo: string[];
}

export interface ContributorMapWithSummary {
  contributorsCount: number;
  repoCount: number;
  repoList: string[];
  exclusionCount: number;
  contributorsDetails: ContributorMap;
}

export interface Output {
  privateRepoList: string[];
  publicRepoList: string[];
  contributorsCount: number;
  repoCount: number;
  undefinedRepoList: string[];
  exclusionCount: number;
  contributorsDetails: [string, Contributor][];
}

export interface Integration {
  org: {
    name: string;
    id: string;
  };
  integrations: IntegrationsGetResponseType;
}

export interface BitbucketServerTarget {
  token: string;
  url: string;
  projectKeys?: string[];
  repo?: string;
}

export interface AzureDevopsTarget {
  token: string;
  OrgName: string;
  projectKeys?: string[];
  repo?: string;
  url?: string;
}

export interface BitbucketCloudTarget {
  user: string;
  password: string;
  workspaces?: string[];
  repo?: string;
}

export interface GitlabTarget {
  token: string;
  url?: string;
  groups?: string[];
  project?: string;
}

export interface GithubTarget {
  token: string;
  orgs?: string[];
  repo?: string;
}

export interface GithubEnterpriseTarget {
  url: string;
  token: string;
  orgs?: string[];
  repo?: string;
  fetchAllOrgs?: boolean;
}
