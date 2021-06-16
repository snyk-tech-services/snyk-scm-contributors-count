# Snyk SCM Contributors counting

This tool is used to count contributors with commits in the last 90 days in repositories matching the following criteria:
1. Repo name XYZ (single repo mode if available for SCM command - see help)
2. All repos in given projects/org/group (ex: Bitbucket Server project(s))
3. All repos in given projects/org/group (ex: Bitbucket Server project(s)) AND monitored by Snyk
4. All repos in SCM (varies a little depending on SCM)
5. All repos in SCM (varies a little depending on SCM) AND monitored by Snyk
 
### Example
I want to know the countributors count for Snyk monitored projects in bitbucket server project key AN.

## Installation
> Require node 14 !

```
npm i -g snyk-scm-contributors-count
```
or use corresponding binaries in the [release page](https://github.com/snyk-tech-services/snyk-scm-contributors-count/releases)


## Usage

> If using binaries, `chmod +x snyk-scm-contributors-count-<env>` to allow execution

```
export SNYK_TOKEN=<YOUR-SNYK-TOKEN>
snyk-scm-contributors-count <command> <command-options>
```

##### Example: 
```
snyk-scm-contributors-count bitbucket-server --token BITBUCKET-TOKEN --url http://bitbucket-server.mycompany.com --projectKeys Key1,Key2 --exclusionFilePath=./snyk.exclude
```

If you can't then type `snyk-scm-contributors-count` in your terminal, then add you bin folder to the PATH in ~/.bash_profile or equivalent. If using nvm, make sure the bin folder for your node version is also in the PATH.

## Common options across commands
- `--skipSnykMonitoredRepos` to skip checking with repos are monitored by Snyk (useful for sizing before Snyk rollout). In that case the SNYK_TOKEN is not required
- `--exclusionFilePath` pointing to snyk.exclude file, simple text file containing emails of committers to exclude (i.e bot@snyk.io, etc...)
- `--json` output JSON

Additional options might be available depending on the command

### Run in DEBUG MODE
Use DEBUG=snyk* env var before your command, for example:
```
DEBUG=snyk* snyk-scm-contributors-count bitbucket-server --token BITBUCKET-TOKEN --url http://bitbucket-server.mycompany.com --projectKeys Key1,Key2 --exclusionFilePath=./snyk.exclude
```



# Development


## Add a command and SCM support

1. Create a new ts file under cmds (duplicate cmds/bitbucket-server.ts)

2. Fill out command, desc, and builder options, leaving in:
- exclusionFilePath
- json
- skipSnykMonitoredRepos

3. The handler function will be called with argv which should match the builder options

4. Create a class with your command name extending SCMHandlerClass.
It'll require you to implement the abstract method `fetchSCMContributors` expecting a `Promise<ContributorMap>` in return
- types can be function in src/lib/types.ts

5. Once create and asbtract function implemented, in handler, instantiate the class you just created

6. Call 
```
<classInstance>.scmContributorCount(argv.url,SourceType["YOUR-SOURCE"],argv.skipSnykMonitoredRepos,argv.exclusionFilePath,argv.json)
```

7. profit.

## Build
```
npm run build
```
or in watch mode
```
npm run build-watch
```

## Best Practices
- Most SCMs have paginated results, fetch all the relevant pages, only what's useful
- Be gentle with rates against SCM. Use client or throttling libs like bottleneck
- Snyk API interaction is using snyk-api-ts-client with built-in throttling and retries