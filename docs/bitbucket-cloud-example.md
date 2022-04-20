## Bitbucket-Cloud
Available options:
```
  --version                 Show version number                        [boolean]
  --help                    Show help                                  [boolean]
  --user                    Bitbucket cloud username                   [required]
  --password                Bitbucket cloud password                   [required]
  --workspaces              [Optional] Bitbucket cloud workspace name/uuid to count contributors for
  --repo                    [Optional] Specific repo to count only for
  --exclusionFilePath       [Optional] Exclusion list filepath
  --json                    [Optional] JSON output, requiered when using the "consolidateResults" command
  --skipSnykMonitoredRepos  [Optional] Skip Snyk monitored repos and count contributors for all repos
  --importConfDir           [Optional] Generate an import file with the unmonitored repos: A path to a valid folder for the generated import files
  --importFileRepoType      [Optional] To be used with the importConfDir flag: Specify the type of repos to be added to the import file. Options: all/private/public. Default: all
```

Before running the command:
1. Export SNYK_TOKEN (if you want to get the contributors ONLY for repos that are already monitored by Snyk) =>
    - Go to [Snyk-account](https://app.snyk.io/account) and create a token if not already exists, make sure that your token has Group level access or  use a service account's token that has Group level access, to learn more on how to create a service account, refer to this [guide](https://docs.snyk.io/features/integrations/managing-integrations/service-accounts#how-to-set-up-a-service-account).
    - Copy the token value
    - Export the token in your enviroment: 
    ```
    export SNYK_TOKEN=<YOUR-SNYK-TOKEN>
    ```
2. Get your Bitbucket-Cloud user and App password =>
    - Make sure that your credentials have access to the repos that you want to get the contributor count for

### Running the command

Consider the following levels of usage and options:

#### Usage levels:
- I want to get commits for all workspaces and their repos in Bitbucket-Cloud => Only provide the Bitbucket-Cloud user and password: 
```
snyk-scm-contributors-count bitbucket-cloud --user USERNAME --password PASSWORD
```

- I want to get commits for some workspaces and their repos in Bitbucket-Cloud => Provide the Bitbucket-Cloud user, Bitbucket-Cloud password and the workspace/s seperated by a comma:
```
snyk-scm-contributors-count bitbucket-cloud --user USERNAME --password PASSWORD --workspaces Workspace1,Workspace2...
```

- I want to get commits for a specific repo in Bitbucket-Cloud => Provide your Bitbucket-Cloud user, Bitbucket-Cloud password, a workspace and a repo name:
```
snyk-scm-contributors-count bitbucket-cloud --user USERNAME --password PASSWORD --workspaces Workspace1 --repo Repo1
```

#### Options:
- I want to get all the commits from Bitbucket-Cloud regardless of the repos that are already monitored by Snyk (You might have repos in Bitbucket-Cloud that are not monitored in Snyk, using this flag will skip checking for Snyk monitored repos and will go directly to Bitbucket-Cloud to fetch tha commits) => add the `--skipSnykMonitoredRepos` flag to the command:
```
snyk-scm-contributors-count bitbucket-cloud --user USERNAME --password PASSWORD --skipSnykMonitoredRepos
```

- I want to exclude some contributors from being counted in the commits => add an exclusion file with the emails to ignore(seperated by commas) and apply the `--exclusionFilePath` with the path to that file to the command:
```
snyk-scm-contributors-count bitbucket-cloud --user USERNAME --password PASSWORD --workspaces Workspace1,Workspace2 --exclusionFilePath PATH_TO_FILE
```

- I want the output to be in json format => add the `--json` flag to the command:
```
snyk-scm-contributors-count bitbucket-cloud --user USERNAME --password PASSWORD --workspaces Workspace1 --repo Repo1 --json
```

- I want the tool to create an import file for me with my unmonitored repos => add the `--importConfDir` flag to the command with a valid (writable) path to a folder in which the import files will be stored and add the `--importFileRepoType` flag (optional) with the repo types to add to the file (all/private/public, defaults to all). (**Note that these flags can not be set with the `--repo` flag**):
```
snyk-scm-contributors-count bitbucket-cloud --user USERNAME --password PASSWORD --importConfDir ValidPathToFolder --importFileRepoType private/public/all
```

- I want to run in debug mode for verbose output => add `DEBUG=snyk*` to the beginning of the command:
```
DEBUG=snyk* snyk-scm-contributors-count bitbucket-cloud --user USERNAME --password PASSWORD --workspaces Workspace1 --repo Repo1 --exclusionFilePath PATH_TO_FILE --skipSnykMonitoredRepos --json
```
