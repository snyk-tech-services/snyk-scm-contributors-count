
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



// fetchSnykMonitoredRepos (fetchSnykCLIMonitoredRepos, fetchSnykSCMMonitoredRepos)
// 2. fetchSCMContributors(snykMonitoredReposList?) => {projectKey, reponame, contributors[]}
// 3. processResults(scmCounts, monitoredRepos,exclusionList)
// 4. Common: outputResults(toFile| display)


// contributors {
//     username: string,
//     email: string,
//     count: number,
//     reposContributedTo: string[]
// }[]

// snykmonitoredrepos: {
//     reponame: string,
//     snykOrg: string,
//     snykGroup: string,
// }[]

// repos {
//     reponame: string,
//     projectKey: string,
// }[]