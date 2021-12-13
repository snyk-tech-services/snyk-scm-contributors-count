import {
  GithubTarget,
  Username,
  Contributor,
  ContributorMap,
  Integration,
} from '../types';
import { Commits, Repo, Org } from './types';
import { fetchAllPages } from './utils';
import * as debugLib from 'debug';
import { createImportFile, genericRepo, genericTarget } from '../common/utils';

const debug = debugLib('snyk:github-count');
let githubDefaultUrl = 'https://api.github.com/';

if (process.env.NODE_ENV == 'test') {
  githubDefaultUrl = 'https://test.api.github.com/';
}

export const fetchGithubContributors = async (
  githubInfo: GithubTarget,
  SnykMonitoredRepos: string[],
  integrations: Integration[],
  importConfDir: string,
  importFileRepoType: string,
  threeMonthsDate: string,
): Promise<ContributorMap> => {
  const contributorsMap = new Map<Username, Contributor>();
  let filePath = '';
  try {
    let repoList: Repo[] = [];
    if (importConfDir && (!SnykMonitoredRepos || !integrations)) {
      console.log('No org or integration data was found');
    }
    if (githubInfo.repo && (!githubInfo.orgs || githubInfo.orgs.length > 1)) {
      // If repo is specified, then a single project key is expected, bail otherwise
      console.log(
        'You must provide a single org name for single repo counting',
      );
      process.exit(1);
    } else if (githubInfo.repo && githubInfo.orgs) {
      // If repo is specified, and we got a single project key
      debug('Counting contributors for single repo');
      repoList.push({
        name: githubInfo.repo,
        owner: { login: githubInfo.orgs[0] },
      });
    } else if (!githubInfo.orgs) {
      githubInfo.orgs = [];
      let orgList: Org[] = [];
      orgList = orgList.concat(
        await fetchGithubOrgs(
          githubDefaultUrl + 'user/orgs?per_page=100',
          githubInfo.token,
        ),
      ) as Org[];
      if (orgList.length < 1) {
        console.log(
          'Did not find any Orgs related to the user, please try to append one/few org/s to the command with the orgs flag and try again',
        );
      }
      for (let i = 0; i < orgList.length; i++) {
        githubInfo.orgs.push(orgList[i].login);
      }
      debug(`Found ${orgList.length} Orgs`);
      repoList = repoList.concat(await fetchGithubReposForOrgs(githubInfo));
    } else {
      // Otherwise retrieve all repos (for given projects or all repos)
      repoList = repoList.concat(await fetchGithubReposForOrgs(githubInfo));
    }
    debug(`Found ${repoList.length} Repos`);
    // Create an api-import files for unmonitored repos
    if (importConfDir) {
      const unmonitoredRepos: Repo[] = repoList.filter(
        (repo) =>
          !SnykMonitoredRepos.includes(`${repo.owner.login}/${repo.name}`),
      );
      filePath = await createImportFile(
        unmonitoredRepos,
        integrations,
        importConfDir,
        importFileRepoType,
        'github',
        filterRepoList,
        orgNameFromRepo,
        populateUnmonitoredRepoList,
      );
    }
    if (filePath != '') {
      console.log(`Import file was created at ${filePath}`);
    }
    if (SnykMonitoredRepos && SnykMonitoredRepos.length > 0) {
      repoList = repoList.filter((repo) =>
        SnykMonitoredRepos.some((monitoredRepo) => {
          return monitoredRepo
            .replace('.git', '')
            .endsWith(`${repo.owner.login}/${repo.name}`);
        }),
      );
    }

    for (let i = 0; i < repoList.length; i++) {
      await fetchGithubContributorsForRepo(
        githubInfo,
        repoList[i],
        contributorsMap,
        threeMonthsDate,
      );
    }
  } catch (err) {
    debug('Failed to retrieve contributors from Github.\n' + err);
    console.log(
      'Failed to retrieve contributors from Github. Try running with `DEBUG=snyk* snyk-contributor`',
    );
  }
  debug(contributorsMap);
  return new Map([...contributorsMap.entries()].sort());
};

export const fetchGithubContributorsForRepo = async (
  GithubInfo: GithubTarget,
  repo: Repo,
  contributorsMap: ContributorMap,
  threeMonthsDate: string,
): Promise<void> => {
  try {
    debug(
      `Fetching single repo contributor from Github. Owner/Org: ${repo.owner?.login} - Repo: ${repo.name}\n`,
    );
    const commits = (await fetchAllPages(
      `${githubDefaultUrl}repos/${repo.owner.login}/${repo.name}/commits?per_page=100&since=${threeMonthsDate}`,
      GithubInfo.token,
      repo.name,
    )) as Commits[];
    for (let i = 0; i < commits.length; i++) {
      const commit = commits[i];
      let contributionsCount = 1;
      const visibility = repo.private ? 'Private' : 'Public';
      let reposContributedTo = [
        `${repo.owner.login}/${repo.name}(${visibility})`,
      ];

      if (
        contributorsMap &&
        (contributorsMap.has(commit.commit.author.name) ||
          contributorsMap.has(commit.commit.author.email))
      ) {
        contributionsCount = contributorsMap.get(commit.commit.author.email)
          ?.contributionsCount
          ? contributorsMap.get(commit.commit.author.email)!.contributionsCount
          : contributorsMap.get(commit.commit.author.name)
              ?.contributionsCount || 0;
        contributionsCount++;

        reposContributedTo = contributorsMap.get(commit.commit.author.email)
          ?.reposContributedTo
          ? contributorsMap.get(commit.commit.author.email)!.reposContributedTo
          : contributorsMap.get(commit.commit.author.name)
              ?.reposContributedTo || [];
        if (
          !reposContributedTo.includes(
            `${repo.owner.login}/${repo.name}(${visibility})`,
          )
        ) {
          // Dedupping repo list here
          reposContributedTo.push(
            `${repo.owner.login}/${repo.name}(${visibility})`,
          );
        }
      }
      const isDuplicateName = await changeDuplicateAuthorNames(
        commit.commit.author.name,
        commit.commit.author.email,
        contributorsMap,
      );
      if (
        !commit.commit.author.email.endsWith('@users.noreply.github.com') &&
        commit.commit.author.email != 'snyk-bot@snyk.io'
      ) {
        contributorsMap.set(isDuplicateName, {
          email: commit.commit.author.email,
          contributionsCount: contributionsCount,
          reposContributedTo: reposContributedTo,
        });
      }
    }
  } catch (err) {
    debug('Failed to retrieve commits from Github.\n' + err);
    console.log(
      'Failed to retrieve commits from Github. Try running with `DEBUG=snyk* snyk-contributor`',
    );
  }
};

const changeDuplicateAuthorNames = async (
  name: string,
  email: string,
  contributorMap: ContributorMap,
): Promise<string> => {
  for (const [username, contributor] of contributorMap) {
    if (username == name && email != contributor.email) {
      return `${name}(duplicate)`;
    }
  }
  return name;
};

export const fetchGithubReposForOrgs = async (
  GithubInfo: GithubTarget,
): Promise<Repo[]> => {
  const repoList: Repo[] = [];
  if (GithubInfo.orgs) {
    try {
      for (let i = 0; i < GithubInfo.orgs.length; i++) {
        const repos = (await fetchAllPages(
          `${githubDefaultUrl}orgs/${GithubInfo.orgs[i]}/repos?per_page=100&sort=full_name`,
          GithubInfo.token,
          GithubInfo.orgs[i],
        )) as Repo[];
        repos.map(
          (repo: {
            name: string;
            owner: { login: string };
            private?: boolean;
            default_branch?: string;
          }) => {
            const { name, owner } = repo;
            if (name && owner.login) {
              repoList.push({
                name,
                owner: { login: owner.login },
                private: repo.private,
                default_branch: repo.default_branch,
              });
            }
          },
        );
      }
    } catch (err) {
      debug('Failed to retrieve repo list from Github.\n' + err);
      console.log(
        'Failed to retrieve repo list from Github. Try running with `DEBUG=snyk* snyk-contributor`',
      );
    }
  }
  return repoList;
};

export const fetchGithubOrgs = async (
  url: string,
  token: string,
): Promise<Org[]> => {
  const orgList: Org[] = [];
  try {
    const orgs = (await fetchAllPages(url, token, 'Orgs')) as Org[];
    orgs.map((org: { login: string }) => {
      const { login } = org;
      if (login) {
        orgList.push({ login: org.login });
      }
    });
  } catch (err) {
    debug('Failed to retrieve project list from Github.\n' + err);
    console.log(
      'Failed to retrieve project list from Github. Try running with `DEBUG=snyk* snyk-contributor`',
    );
  }
  return orgList;
};

export const filterRepoList = async (
  unmonitoredRepoList: genericRepo[],
  repoType: string,
): Promise<genericRepo[]> => {
  let reTypedRepoList = unmonitoredRepoList as Repo[];
  if (repoType.toLowerCase() == 'private') {
    reTypedRepoList = reTypedRepoList.filter((repo) => repo.private == true);
  } else if (repoType.toLowerCase() == 'public') {
    reTypedRepoList = reTypedRepoList.filter((repo) => repo.private == false);
  }
  return reTypedRepoList;
};

export const orgNameFromRepo = async (repo: genericRepo): Promise<string> => {
  const reTypedRepo = repo as Repo;
  return reTypedRepo.owner.login;
};

export const populateUnmonitoredRepoList = async (
  repo: genericRepo,
  integration: Integration,
  orgID: string,
  integrationID: string,
): Promise<genericTarget[]> => {
  const reTypedRepo = repo as Repo;
  const targetList: genericTarget[] = [];
  targetList.push({
    integrationId: integration.integrations['github'] || integrationID,
    orgId: integration.org.id || orgID,
    target: {
      name: reTypedRepo.name,
      owner: reTypedRepo.owner.login,
      branch: reTypedRepo.default_branch || 'master',
    },
  });
  return targetList;
};
