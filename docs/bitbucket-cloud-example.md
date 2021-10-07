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
  --json                    [Optional] JSON output
  --skipSnykMonitoredRepos  [Optional] Skip Snyk monitored repos and count contributors for all repos
```

Before running the command:
1. Export SNYK_TOKEN (if you want to get the contributors ONLY for repos that are already monitored by Snyk) =>
    - Go to [Snyk-account](https://app.snyk.io/account) and create a token if not already exists.
    - Copy the token value
    - Export the token in your enviroment: 
    ```
    export SNYK_TOKEN=<YOUR-SNYK-TOKEN>
    ```
2. Get your Bitbucket-Cloud user and password =>
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

- I want to run in debug mode for verbose output => add `DEBUG=snyk*` to the beginning of the command:
```
DEBUG=snyk* snyk-scm-contributors-count bitbucket-cloud --user USERNAME --password PASSWORD --workspaces Workspace1 --repo Repo1 --exclusionFilePath PATH_TO_FILE --skipSnykMonitoredRepos --json
```
