
export type ContributorMap = Map<Username,Contributor>

export type Username = string

export interface Contributor {
    email: string,
    alternateEmails?: string[],
    contributionsCount: number,
    reposContributedTo: string[]
}

export interface ContributorMapWithSummary {

  contributorsCount: number,
  repoCount: number,
  repoList: string[],
  exclusionCount: number,
  contributorsDetails: ContributorMap
}

export interface Output {

  contributorsCount: number,
  repoCount: number,
  repoList: string[],
  exclusionCount: number,
  contributorsDetails: [string, Contributor][]
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
}
