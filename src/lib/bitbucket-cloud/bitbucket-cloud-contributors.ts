import { BitbucketCloudTarget, Integration } from '../types';
import { Commits, ContributorMap, Contributor, Repo } from './types';
import { fetchAllPages, isAnyCommitMoreThan90Days } from './utils';
import { createImportFile, genericRepo, genericTarget } from '../common/utils';
import * as debugLib from 'debug';
const bitbucketCloudDefaultUrl = 'https://bitbucket.org';
const debug = debugLib('snyk:bitbucket-cloud-count');

export const fetchBitbucketCloudContributors = async (
  bitbucketCloudInfo: BitbucketCloudTarget,
  SnykMonitoredRepos: string[],
  integrations: Integration[],
  importConfDir: string,
  importFileRepoType: string,
): Promise<ContributorMap> => {
  const contributorsMap: ContributorMap = new Map([]);
  let filePath = '';
  try {
    let repoList: Repo[] = [];

    if (
      bitbucketCloudInfo.repo &&
      (!bitbucketCloudInfo.workspaces ||
        bitbucketCloudInfo.workspaces.length > 1)
    ) {
      // If repo is specified, then a single project key is expected, bail otherwise
      console.log('You must provide a single project for single repo counting');
      process.exit(1);
    } else if (bitbucketCloudInfo.repo) {
      // If repo is specified, and we got a single project key
      debug('Counting contributors for single repo');
      if (bitbucketCloudInfo.workspaces) {
        repoList.push({
          slug: bitbucketCloudInfo.repo,
          workspace: { uuid: bitbucketCloudInfo.workspaces[0] },
        });
      }
    } else {
      // Otherwise retrieve all repos (for given projects or all repos)
      repoList = repoList.concat(
        await fetchBitbucketCloudReposForWorkspaces(bitbucketCloudInfo),
      );
    }
    debug(`Found ${repoList.length} Repos`);
    if (importConfDir) {
      const unmonitoredRepos: Repo[] = repoList.filter(
        (repo) =>
          !SnykMonitoredRepos.includes(`${repo.workspace.uuid}/${repo.slug}`) ||
          !SnykMonitoredRepos.includes(`${repo.workspace.slug}/${repo.slug}`),
      );
      filePath = await createImportFile(
        unmonitoredRepos,
        integrations,
        importConfDir,
        importFileRepoType,
        'bitbucket-cloud',
        filterRepoList,
        orgNameFromRepo,
        populateUnmonitoredRepoList,
      );
    }

    if (filePath != '') {
      console.log(`Import file was created at ${filePath}`);
    }

    if (SnykMonitoredRepos && SnykMonitoredRepos.length > 0) {
      repoList = repoList.filter(
        (repo) =>
          SnykMonitoredRepos.includes(`${repo.workspace.uuid}/${repo.slug}`) ||
          SnykMonitoredRepos.includes(`${repo.workspace.slug}/${repo.slug}`),
      );
    }

    for (let i = 0; i < repoList.length; i++) {
      await fetchBitbucketCloudContributorsForRepo(
        bitbucketCloudInfo,
        repoList[i],
        contributorsMap,
      );
    }
    debug(contributorsMap);
    return contributorsMap;
  } catch (err) {
    debug('Failed to retrieve contributors from bitbucket-cloud.\n' + err);
    console.log(
      'Failed to retrieve contributors from bitbucket-cloud. Try running with `DEBUG=snyk* snyk-contributor`',
    );
  }
  debug(contributorsMap);
  return new Map([...contributorsMap.entries()].sort());
};

export const getRepoId = (repo: Repo): string => {
  return `${repo.workspace.slug || repo.workspace.uuid}/${repo.slug}(${
    repo.is_private ? 'Private' : 'Public'
  })`;
};

export const extractEmailAddress = (raw: string): string | null => {
  // Check for the presence of '<' and '>'
  if (!/<.+@.+>$/.test(raw)) {
    return null;
  }
  const parts = raw.split(/[<>]/);
  // We should have ['Foo Bar ', 'foo@bar.com', '']
  if (parts.length !== 3) {
    return null;
  }

  return parts[1];
};

export const processCommit = (
  commit: Commits,
  repoId: string,
  contributorsMap: ContributorMap,
): ContributorMap => {
  const { author } = commit;
  const userId = author.user.uuid;
  const email =
    author?.emailAddress !== undefined
      ? author.emailAddress
      : extractEmailAddress(author.raw) ?? '';

  if (!contributorsMap.has(userId)) {
    // We have not seen this contributor before.
    contributorsMap.set(author.user.uuid, {
      name: author.user.display_name,
      email,
      alternateEmails: [],
      reposContributedTo: [repoId],
      contributionsCount: 1,
    });
    return contributorsMap;
  }
  // Known contributor, add additional information if we have any.
  const contributor = contributorsMap.get(userId) as Contributor;
  contributor.contributionsCount += 1;
  if (
    contributor.email !== email &&
    !contributor.alternateEmails.includes(email)
  ) {
    contributor.alternateEmails.push(email);
  }
  if (!contributor.reposContributedTo.includes(repoId)) {
    contributor.reposContributedTo.push(repoId);
  }
  contributorsMap.set(userId, contributor);

  return contributorsMap;
};

export const fetchBitbucketCloudContributorsForRepo = async (
  bitbucketCloudInfo: BitbucketCloudTarget,
  repo: Repo,
  contributorsMap: ContributorMap,
): Promise<void> => {
  const fullUrl = `${bitbucketCloudDefaultUrl}/api/2.0/repositories/${repo.workspace.uuid}/${repo.slug}/commits`;
  try {
    debug(
      `Fetching single repo contributor from bitbucket-cloud. Workspace ${repo.workspace.uuid} - Repo ${repo.slug}\n`,
    );

    // 7776000000 == 90 days in ms

    const response = await fetchAllPages<Commits>(
      fullUrl,
      bitbucketCloudInfo.user,
      bitbucketCloudInfo.password,
      repo.slug,
      isAnyCommitMoreThan90Days,
    );

    const date: Date = new Date();
    let today = date.getTime();
    if (process.env.NODE_ENV == 'test') {
      today = date.setFullYear(2020, 6, 15);
    }
    for (const commit of response) {
      // > is the right way, < is for testing really
      // todayDate - 90 days should be smaller than commit timestamp, otherwise timestamp occured before 90days
      const epochDateFromCommit = new Date(commit.date).getTime();
      if (today - 7776000000 > epochDateFromCommit) {
        // Skipping if more than 90 days old
        continue;
      }
      if (!commit.author.user) {
        // Skipping if user object is not defined (should never happen)
        continue;
      }

      contributorsMap = processCommit(commit, getRepoId(repo), contributorsMap);
    }
  } catch (err) {
    debug('Failed to retrieve commits from bitbucket-cloud.\n' + err);
    console.log(
      'Failed to retrieve commits from bitbucket-cloud. Try running with `DEBUG=snyk* snyk-contributor`',
    );
  }
};

export const fetchBitbucketCloudReposForWorkspaces = async (
  bitbucketCloudInfo: BitbucketCloudTarget,
): Promise<Repo[]> => {
  let repoList: Repo[] = [];

  // Filtering only the lowest role (member) to get the most repos (role is mandatory when using the is_private query)
  const fullUrlSet: string[] = !bitbucketCloudInfo.workspaces
    ? [
        `${bitbucketCloudDefaultUrl}/api/2.0/repositories?q=is_private=true&role=member`,
        `${bitbucketCloudDefaultUrl}/api/2.0/repositories?q=is_private=false&role=member`,
      ]
    : bitbucketCloudInfo.workspaces.map(
        (workspace) =>
          `${bitbucketCloudDefaultUrl}/api/2.0/repositories/${workspace}`,
      );
  try {
    for (let i = 0; i < fullUrlSet.length; i++) {
      debug(`Fetching repos list\n`);
      repoList = repoList.concat(
        await fetchAllPages<Repo>(
          fullUrlSet[i],
          bitbucketCloudInfo.user,
          bitbucketCloudInfo.password,
          'Repositories',
        ),
      );
    }
    return repoList;
  } catch (err) {
    debug('Failed to retrieve repo list from bitbucket-cloud.\n' + err);
    console.log(
      'Failed to retrieve repo list from bitbucket-cloud. Try running with `DEBUG=snyk* snyk-contributor`',
    );
  }
  return repoList;
};

export const filterRepoList = async (
  unmonitoredRepoList: genericRepo[],
  repoType: string,
): Promise<genericRepo[]> => {
  let reTypedRepoList = unmonitoredRepoList as Repo[];
  if (repoType.toLowerCase() == 'private') {
    reTypedRepoList = reTypedRepoList.filter((repo) => repo.is_private == true);
  } else if (repoType.toLowerCase() == 'public') {
    reTypedRepoList = reTypedRepoList.filter(
      (repo) => repo.is_private == false,
    );
  }
  return reTypedRepoList;
};

export const orgNameFromRepo = async (repo: genericRepo): Promise<string> => {
  const reTypedRepo = repo as Repo;
  return reTypedRepo.workspace.slug as string;
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
    integrationId: integration.integrations['bitbucket-cloud'] || integrationID,
    orgId: integration.org.id || orgID,
    target: {
      name: reTypedRepo.slug,
      owner: reTypedRepo.workspace.slug as string,
      branch: reTypedRepo.mainbranch?.name || 'master',
    },
  });
  return targetList;
};
