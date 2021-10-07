## Gitlab
Available options:
```
  --version                 Show version number                        [boolean]
  --help                    Show help                                  [boolean]
  --token                   Gitlab token                               [required]
  --url                     [Optional] Your Gitlab host custom URL. If no host was provided
                            it will default to https://gitlab.com/
  --groups                  [Optional] Your Gitlab groups names to count contributors for 
                            *note* for sub-level groups, please provide the lowest level group name                
  --project                 [Optional] Your Gitlab project path with namespace to count contributors for
  --exclusionFilePath       [Optional] Exclusion list filepath
  --json                    [Optional] JSON output
  --skipSnykMonitoredRepos  [Optional] Skip Snyk monitored projects and count contributors for all projects
```

Before running the command:
1. Export SNYK_TOKEN (if you want to get the contributors ONLY for projects that are already monitored by Snyk) =>
    - Go to [Snyk-account](https://app.snyk.io/account) and create a token if not already exists.
    - Copy the token value
    - Export the token in your enviroment: 
    ```
    export SNYK_TOKEN=<YOUR-SNYK-TOKEN>
    ```
2. Get your Gitlab token or create a new one with this [guide](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html) =>
    - Make sure that your token has access to the projects that you want to get the contributors count for

### Running the command

Consider the following levels of usage and options:

#### Usage levels:
- I want to get commits for all groups and their projects in Gitlab => Only provide the Gitlab token (and server url for Gitlab Enterprise): 
```
snyk-scm-contributors-count gitlab --token TOKEN --url URL
```

- I want to get commits for some groups and their projects in Gitlab => Provide the Gitlab token
  and the groups names, seperated by a comma:
```
snyk-scm-contributors-count gitlab --token TOKEN --groups GROUP1,GROUP2
```

- I want to get commits for only one project in Gitlab => Provide the Gitlab token,
  one group name and one project name:
```
snyk-scm-contributors-count gitlab --token TOKEN --groups Group --project PROJECT
```

#### Options:
- I want to get all the commits from Gitlab regardless of the projects that are already monitored by Snyk (You might have projects in Gitlab that are not monitored in Snyk, using this flag will skip checking for Snyk monitored projects and will go directly to Gitlab to fetch tha commits) => add the `--skipSnykMonitoredRepos` flag to the command:
```
snyk-scm-contributors-count gitlab --token TOKEN --url URL --skipSnykMonitoredRepos
```

- I want to exclude some contributors from being counted in the commits => add an exclusion file with the emails to ignore(seperated by commas) and apply the `--exclusionFilePath` with the path to that file to the command:
```
snyk-scm-contributors-count gitlab --token TOKEN --projectKeys Path1/Namespace1 --exclusionFilePath PATH_TO_FILE
```

- I want the output to be in json format => add the `--json` flag to the command:
```
snyk-scm-contributors-count gitlab --token TOKEN --json
```

- I want to run in debug mode for verbose output => add `DEBUG=snyk*` to the beginning of the command:
```
DEBUG=snyk* snyk-scm-contributors-count gitlab --token TOKEN --url URL --exclusionFilePath PATH_TO_FILE --json
```
