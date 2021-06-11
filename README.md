## Add a command

1. Create a new ts file under cmds
2. Implement the below for your command. Implementing the interface will require you to implement the fetchSCMContributors function returning a predictable type
3. From there, the functions to dedup repos, contributors and exclusion are simply steps to execute with already built functions expecting fetchSCMContributors of a certain shape.
4. in other words, once you implement fetchSCMContributors to return a Map with the expected fields, you only need to go through the steps with already built functions.

5. this file needs to following

```
import * as debugLib from "debug";
import * as ora from 'ora';
import { SCMHandlerClass, SCMHandlerInterface } from '../lib/common/SCMHandler'

const debug = debugLib("snyk:YOUR-CMD-count");

export const command = ["<YOUR-CMD>"];
export const desc = "Count contributors for YOUR-CMD.\n";

export const builder = {
// options like
  token: { required: true, default: undefined, desc: "Bitbucket server token" },

};

export class YOURCLASS extends SCMHandlerClass implements SCMHandlerInterface {
  
  constructor(xyzInfo:XYZTarget) {
      super()
    ...
  }

  
  async fetchSCMContributors(SnykMonitoredRepos:string[]) {
    ...
    // to implement, return Promise<ContributorMap>
  }
}

export async function handler(argv: {
  token: string;
  url: string;
  projectKeys?: string;
  repo?: string;
  exclusionFilePath?: string;
}): Promise<void> {

    const scmTarget: xyzTarget = {
        // relevant options from command line
    }

    const spinner = ora('Loading snyk monitored repos list');
    
    if(process.env.DEBUG){
        debug("DEBUG MODE ENABLED \n");    
        spinner.stop()
    } else {
        spinner.start()
    }

    debug("Loading snyk monitored repos list \n");
    spinner.succeed()
    const scmTarget:XYZTarget = {
        // options like
        token:argv.token,
        url: argv.url,
        projectKeys: argv.projectKeys?.split(','),
        repo: argv.repo
    }

    // Instantiate your class implementing fetchSCMContributors
    let xyzTask = new YOURCLASS(xyzTarget)

    const snykImportedRepos = await xyzTask.retrieveMonitoredRepos(argv.url, xyzTask.SourceType["YOUR-CMD"])
    debug("Retrieving projects from YOUR-CMD \n");
    spinner.text = 'Retrieving projects from YOUR-CMD with commits in last 90 days';
    const contributors = await xyzTask.fetchSCMContributors(snykImportedRepos);
    spinner.succeed()

    debug('Repos in Snyk')
    const deduppedSnykImportedRepos = xyzTask.dedupRepos(snykImportedRepos)
    debug(deduppedSnykImportedRepos)
    debug('Contributors before exclusion')
    const deduppedContributors = xyzTask.dedupContributorsByEmail(contributors)
    debug(deduppedContributors)

    const contributorsList = xyzTask.excludeFromListByEmail(deduppedContributors,argv.exclusionFilePath)
    debug('Contributors after exclusion list')
    debug(contributorsList)

}
```
6. See cmds/bitbucket-server.ts for example. Note that the stats calculation and the output functions are not yet built. They will be generic anyways so you don't need to worry about it, simply use them
7. Use debug and ora spinners for good UX
8. run with DEBUG=SNYK* node index.js ...... to run in debug mode.