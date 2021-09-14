## Gitlab
Available options:
```
  --version                 Show version number                        [boolean]
  --help                    Show help                                  [boolean]
  --token                   Gitlab token                               [required]
  --host                    [Optional] Your Gitlab host custom URL. If no host was provided
                            it will default to https://gitlab.com/                
  --projectKeys             [Optional] Your Gitlab project paths with namespaces or
                            project IDs to count contributors for
  --exclusionFilePath       [Optional] Exclusion list filepath
  --json                    [Optional] JSON output
```

Before running the command:
1. Get your Gitlab token =>
    - Make sure that your token has access to the projects that you want to get the contributor count for

### Running the command

Consider the following levels of usage and options:

#### Usage levels:
- I want to get commits for all projects and their repos in Gitlab => Only provide the Gitlab token: 
```
snyk-scm-contributors-count gitlab --token TOKEN --host URL
```

- I want to get commits for some projects and their repos in Gitlab => Provide the Gitlab token
  and the project/s path with namespace or IDs, seperated by a comma:
```
snyk-scm-contributors-count gitlab --token TOKEN --projectKeys ID1,ID2,Path1/Namespace1,Path1/Namespace2...
```

#### Options:
- I want to exclude some contributors from being counted in the commits => add an exclusion file with the emails to ignore(seperated by commas) and apply the `--exclusionFilePath` with the path to that file to the command:
```
snyk-scm-contributors-count gitlab --token TOKEN --projectKeys ID1,ID2,Path1/Namespace1 --exclusionFilePath PATH_TO_FILE
```

- I want the output to be in json format => add the `--json` flag to the command:
```
snyk-scm-contributors-count gitlab --token TOKEN --json
```

- I want to run in debug mode for verbose output => add `DEBUG=snyk*` to the beginning of the command:
```
DEBUG=snyk* snyk-scm-contributors-count gitlab --token TOKEN --host URL --exclusionFilePath PATH_TO_FILE --json
```
