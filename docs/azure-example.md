## Azure-Devops
Available options:
```
  --version                 Show version number                        [boolean]
  --help                    Show help                                  [boolean]
  --token                   Azure Devops token                         [required]
  --org                     Your Org name in Azure Devops e.g. https://dev.azure.com/{OrgName}           [required]
  --projectKeys             [Optional] Azure Devops project key/name to count
                            contributors for
  --repo                    [Optional] Specific repo to count only for
  --exclusionFilePath       [Optional] Exclusion list filepath
  --json                    [Optional] JSON output
  --skipSnykMonitoredRepos  [Optional] Skip Snyk monitored repos and count contributors for all repos
```

### Before running the command:
1. Export SNYK_TOKEN (if you want to get the contributors ONLY for repos that are already monitored by Snyk) =>
    - Go to [Snyk-account](https://app.snyk.io/account) and create a token if not already exists.
    - Copy the token value
    - Export the token in your enviroment: 
    ```
    export SNYK_TOKEN=<YOUR-SNYK-TOKEN>
    ```
2. Get your Azure-Devops Token and Org =>
    - Create a Token if not already exists using this [guide](https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops&tabs=preview-page)
    - Your Org name in Azure is listed on the left pane in [Azure-Devops-site](https://dev.azure.com/)

### Running the command

Consider the following levels of usage and options:

##### Usage levels:
- I want to get commits for all projects and their repos under my Org in Azure => Only provide the Azure token and Azure Org: 
```
snyk-scm-contributors-count azure-devops --token AZURE-TOKEN --org AZURE-ORG
```

- I want to get commits for some projects and their repos under my Org in Azure => Provide the Azure token, Azure Org and the project key/s seperated by a comma:
```
snyk-scm-contributors-count azure-devops --token AZURE-TOKEN --org AZURE-ORG --projectKeys Key1,Key2...
```

- I want to get commits for a specific repo under my Org in Azure => Provide your Azure token, Azure Org, a project key and a repo name:
```
snyk-scm-contributors-count azure-devops --token AZURE-TOKEN --org AZURE-ORG --projectKeys Key1 --repo Repo1
```

#### Options:
- I want to get all the commits from Azure regardless of the repos that are already monitored by Snyk (You might have repos in Azure that are not monitored in Snyk, using this flag will skip checking for Snyk monitored repos and will go directly to Azure to fetch tha commits) => add the `--skipSnykMonitoredRepos` flag to the command:
```
snyk-scm-contributors-count azure-devops --token AZURE-TOKEN --org AZURE-ORG --skipSnykMonitoredRepos
```

- I want to exclude some contributors from being counted in the commits => add an exclusion file with the emails to ignore(seperated by commas) and apply the `--exclusionFilePath` with the path to that file to the command:
```
snyk-scm-contributors-count azure-devops --token AZURE-TOKEN --org AZURE-ORG --projectKeys Key1,Key2 --exclusionFilePath PATH_TO_FILE
```

- I want the output to be in json format => add the `--json` flag to the command:
```
snyk-scm-contributors-count azure-devops --token AZURE-TOKEN --org AZURE-ORG --projectKeys Key1 --repo Repo1 --json
```

- I want to run in debug mode for verbose output => add `DEBUG=snyk*` to the beginning of the command:
```
DEBUG=snyk* snyk-scm-contributors-count azure-devops --token AZURE-TOKEN --org AZURE-ORG --projectKeys Key1 --repo Repo1 --exclusionFilePath PATH_TO_FILE --skipSnykMonitoredRepos --json
```
