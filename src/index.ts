#!/usr/bin/env node

import * as yargs from 'yargs';

yargs
  .commandDir('cmds')
  .help()
  .demandCommand()
  .argv


/* Should be 2 or 3 mode of operations

1. Count contributors for all repos in a given org/group/projectKey
2. Count contributors for a specific repo in org/group/projectKey
3. Count contributors for only the repos monitored by Snyk

handlers should call a common interface preferably
    1. fetchSnykMonitoredRepos (fetchSnykCLIMonitoredRepos, fetchSnykSCMMonitoredRepos)
    2. fetchSCMCounts(snykMonitoredReposList?) => {projectKey, reponame, contributors[]}
    3. processResults(scmCounts, monitoredRepos,exclusionList)
    4. Common: outputResults(toFile| display)
    

    contributors {
        username: string,
        email: string,
        count: number,
        reposContributedTo: string[]
    }[]

    snykmonitoredrepos: {
        reponame: string,
        snykOrg: string,
        snykGroup: string,
    }[]

    repos {
        reponame: string,
        projectKey: string,
    }[]

*/

