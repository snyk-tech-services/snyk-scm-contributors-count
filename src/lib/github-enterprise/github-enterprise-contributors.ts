import {
  GithubEnterpriseTarget,
  Username,
  Contributor,
  ContributorMap,
} from '../types';
import { Commits, Repo, Org } from './types';
import { fetchAllPages } from './utils';

import * as debugLib from 'debug';
const debug = debugLib('snyk:github-enterprise-count');

export const fetchGithubEnterpriseContributors = async (
  githubEnterpriseInfo: GithubEnterpriseTarget,
  SnykMonitoredRepos: string[],
  threeMonthsDate: string,
): Promise<ContributorMap> => {
  const contributorsMap = new Map<Username, Contributor>();
  try {
    let repoList: Repo[] = [];
    let orgList: Org[] = [];
    if (
      githubEnterpriseInfo.repo &&
      (!githubEnterpriseInfo.orgs || githubEnterpriseInfo.orgs.length > 1)
    ) {
      // If repo is specified, then a single project key is expected, bail otherwise
      console.log(
        'You must provide a single org name for single repo counting',
      );
      process.exit(1);
    } else if (githubEnterpriseInfo.repo && githubEnterpriseInfo.orgs) {
      // If repo is specified, and we got a single project key
      debug('Counting contributors for single repo');
      repoList.push({
        name: githubEnterpriseInfo.repo,
        owner: { login: githubEnterpriseInfo.orgs[0] },
      });
    } else if (!githubEnterpriseInfo.orgs) {
      githubEnterpriseInfo.orgs = [];
      orgList = orgList.concat(
        await fetchGithubEnterpriseOrgs(
          githubEnterpriseInfo.fetchAllOrgs
            ? `${githubEnterpriseInfo.url}api/v3/organizations?per_page=100`
            : `${githubEnterpriseInfo.url}api/v3/user/orgs?per_page=100`,
          githubEnterpriseInfo.token,
        ),
      );
      for (let i = 0; i < orgList.length; i++) {
        githubEnterpriseInfo.orgs.push(orgList[i].login);
      }
      repoList = repoList.concat(
        await fetchGithubEnterpriseReposForOrgs(githubEnterpriseInfo),
      );
    } else {
      // Otherwise retrieve all repos (for given projects or all repos)
      repoList = repoList.concat(
        await fetchGithubEnterpriseReposForOrgs(githubEnterpriseInfo),
      );
    }

    if (SnykMonitoredRepos && SnykMonitoredRepos.length > 0) {
      repoList = repoList.filter((repo) =>
        SnykMonitoredRepos.includes(`${repo.owner.login}/${repo.name}`),
      );
    }

    for (let i = 0; i < repoList.length; i++) {
      await fetchGithubEnterpriseContributorsForRepo(
        githubEnterpriseInfo,
        repoList[i],
        contributorsMap,
        threeMonthsDate,
      );
    }
  } catch (err) {
    debug('Failed to retrieve contributors from Github Enterprise.\n' + err);
    console.log(
      'Failed to retrieve contributors from Github Enterprise. Try running with `DEBUG=snyk* snyk-contributor`',
    );
  }
  debug(contributorsMap);
  return contributorsMap;
};

export const fetchGithubEnterpriseContributorsForRepo = async (
  githubEnterpriseInfo: GithubEnterpriseTarget,
  repo: Repo,
  contributorsMap: ContributorMap,
  threeMonthsDate: string,
): Promise<void> => {
  try {
    debug(
      `Fetching single repo contributor from Github Enterprise. Owner/Org: ${repo.owner?.login} - Repo: ${repo.name}\n`,
    );
    const commits = (await fetchAllPages(
      `${githubEnterpriseInfo.url}api/v3/repos/${repo.owner.login}/${repo.name}/commits?per_page=100&since=${threeMonthsDate}`,
      githubEnterpriseInfo.token,
      repo.name,
    )) as Commits[];
    for (let i = 0; i < commits.length; i++) {
      const commit = commits[i];
      let contributionsCount = 1;
      const visibility = repo.private ? 'Private' : 'Public';
      let reposContributedTo = [
        `${repo.owner.login}/${repo.name}(${visibility})`,
      ];

      if (contributorsMap && contributorsMap.has(commit.commit.author.name)) {
        contributionsCount =
          contributorsMap.get(commit.commit.author.name)?.contributionsCount ||
          0;
        contributionsCount++;

        reposContributedTo =
          contributorsMap.get(commit.commit.author.name)?.reposContributedTo ||
          [];
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
      if (
        !commit.commit.author.email.endsWith('@users.noreply.github.com') &&
        commit.commit.author.email != 'snyk-bot@snyk.io'
      ) {
        contributorsMap.set(commit.commit.author.name, {
          email: commit.commit.author.email,
          contributionsCount: contributionsCount,
          reposContributedTo: reposContributedTo,
        });
      }
    }
  } catch (err) {
    debug('Failed to retrieve commits from Github Enterprise.\n' + err);
    console.log(
      'Failed to retrieve commits from Github Enterprise. Try running with `DEBUG=snyk* snyk-contributor`',
    );
  }
};

export const fetchGithubEnterpriseReposForOrgs = async (
  githubEnterpriseInfo: GithubEnterpriseTarget,
): Promise<Repo[]> => {
  const repoList: Repo[] = [];
  if (githubEnterpriseInfo.orgs) {
    try {
      for (let i = 0; i < githubEnterpriseInfo.orgs.length; i++) {
        const repos = (await fetchAllPages(
          `${githubEnterpriseInfo.url}api/v3/orgs/${githubEnterpriseInfo.orgs[i]}/repos?per_page=100&sort=full_name`,
          githubEnterpriseInfo.token,
          githubEnterpriseInfo.orgs[i],
        )) as Repo[];
        repos.map(
          (repo: {
            name: string;
            owner: { login: string };
            private?: boolean;
          }) => {
            const { name, owner } = repo;
            if (name && owner.login) {
              repoList.push({
                name,
                owner: { login: owner.login },
                private: repo.private,
              });
            }
          },
        );
      }
    } catch (err) {
      debug('Failed to retrieve repo list from Github Enterprise.\n' + err);
      console.log(
        'Failed to retrieve repo list from Github Enterprise. Try running with `DEBUG=snyk* snyk-contributor`',
      );
    }
  }
  return repoList;
};

export const fetchGithubEnterpriseOrgs = async (
  url: string,
  token: string,
): Promise<Org[]> => {
  const orgList: Org[] = [];
  try {
    const orgs = (await fetchAllPages(url, token, 'Organizations')) as Org[];
    orgs.map((org: { login: string }) => {
      const { login } = org;
      if (login) {
        orgList.push({ login: org.login });
      }
    });
  } catch (err) {
    debug('Failed to retrieve project list from Github Enterprise.\n' + err);
    console.log(
      'Failed to retrieve project list from Github Enterprise. Try running with `DEBUG=snyk* snyk-contributor`',
    );
  }
  return orgList;
};
