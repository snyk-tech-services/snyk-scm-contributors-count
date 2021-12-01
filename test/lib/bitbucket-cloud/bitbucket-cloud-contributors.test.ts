import * as nock from 'nock';
import * as fs from 'fs';
import * as path from 'path';
import * as bitbucketCloud from '../../../src/lib/bitbucket-cloud/bitbucket-cloud-contributors';
import {
  extractEmailAddress,
  processCommit,
} from '../../../src/lib/bitbucket-cloud/bitbucket-cloud-contributors';
import { BitbucketCloudTarget } from '../../../src/lib/types';
import {
  Contributor,
  ContributorMap,
  Repo,
} from '../../../src/lib/bitbucket-cloud/types';
import { Commits } from '../../../dist/lib/bitbucket-cloud/types';

const fixturesFolderPath =
  path.resolve(__dirname, '../..') + '/fixtures/bitbucket-cloud/';

beforeEach(() => {
  return nock('https://bitbucket.org')
    .persist()
    .get(/.*/)
    .reply(200, (uri) => {
      console.log(uri);
      switch (uri) {
        case '/api/2.0/repositories/snyk-test':
          return fs.readFileSync(fixturesFolderPath + 'snyk-test-repos.json');
        case '/api/2.0/repositories/69a57492-684f-4c09-b8ba-17e03bd5e04a/testRepo1/commits':
          return fs.readFileSync(fixturesFolderPath + 'testRepo1-commits.json');
        case '/api/2.0/repositories/snyk-main':
          return fs.readFileSync(fixturesFolderPath + 'repos-page1.json');
        case '/api/2.0/repositories/snyk-main/page2':
          return fs.readFileSync(fixturesFolderPath + 'repos-page2.json');
        default:
      }
    });
});

describe('Extracting email-addresses from author.raw', () => {
  test('regular author.raw value', () => {
    const expected = 'foo@bar.com';
    const mockRaw = `Foo Bar <${expected}>`;

    expect(extractEmailAddress(mockRaw)).toEqual(expected);
  });

  test('raw value without name', () => {
    const expected = 'foo@bar.com';
    const mockRaw = `<${expected}>`;

    expect(extractEmailAddress(mockRaw)).toEqual(expected);
  });

  test('raw value without angle-brackets returns null', () => {
    const expected = null;
    const mockRaw = `Foo Bar foo@bar.com`;

    expect(extractEmailAddress(mockRaw)).toEqual(expected);
  });

  test('raw value without @ returns null', () => {
    const expected = null;
    const mockRaw = `Foo Bar <foo.bar.com>`;

    expect(extractEmailAddress(mockRaw)).toEqual(expected);
  });

  test('empty raw value returns null', () => {
    const expected = null;
    const mockRaw = ``;

    expect(extractEmailAddress(mockRaw)).toEqual(expected);
  });
});

describe('Processing bitbucket-cloud commits', () => {
  let mockCommit1: Commits;
  let mockCommit2: Commits;
  let mockCommit3: Commits;
  let mockCommit4: Commits;

  beforeAll(async () => {
    const MockCommits = await import('./bitbucket-cloud-mock-commits');
    mockCommit1 = MockCommits.mockCommit1;
    mockCommit2 = MockCommits.mockCommit2;
    mockCommit3 = MockCommits.mockCommit3;
    mockCommit4 = MockCommits.mockCommit4;
  });

  test('Test processCommit with empty contributorsMap', async () => {
    const mockCommit = mockCommit1;
    const mockUuid = mockCommit1.author.user.uuid;
    const exp: Contributor = {
      email: '<mockEmail1@example.com>',
      name: 'mockDisplayName1',
      alternateEmails: [],
      contributionsCount: 1,
      reposContributedTo: ['mockRepo'],
    };

    const actual = processCommit(mockCommit, 'mockRepo', new Map());
    expect(actual).toEqual(new Map([[mockUuid, exp]]));
  });

  test('Test multiple email-addresses for the same UUID', () => {
    const commits = [mockCommit1, mockCommit2];
    const mockUuid = mockCommit1.author.user.uuid;
    const exp: Contributor = {
      email: '<mockEmail1@example.com>',
      name: 'mockDisplayName1',
      alternateEmails: [mockCommit2.author.emailAddress],
      contributionsCount: 2,
      reposContributedTo: ['mockRepo'],
    };
    let contributorsMap = new Map<string, Contributor>([]);
    for (const commit of commits) {
      contributorsMap = processCommit(commit, 'mockRepo', contributorsMap);
    }

    expect(mockCommit1.author.user.uuid).toEqual(mockCommit2.author.user.uuid);
    expect(contributorsMap).toEqual(new Map([[mockUuid, exp]]));
  });

  test("Test multiple UUID's for the same email-address", () => {
    const expectedContributor = {
      email: '<mockEmail3@example.com>',
      name: 'mockDisplayName3',
      alternateEmails: [],
      contributionsCount: 1,
      reposContributedTo: ['mockRepo'],
    };
    const commits = [mockCommit3, mockCommit4];
    const expected = new Map<string, Contributor>([
      [mockCommit3.author.user.uuid, expectedContributor],
      [mockCommit4.author.user.uuid, expectedContributor],
    ]);

    let contributorsMap = new Map<string, Contributor>();
    for (const commit of commits) {
      contributorsMap = processCommit(commit, 'mockRepo', contributorsMap);
    }

    expect(mockCommit3.author.raw).toEqual(mockCommit4.author.raw);
    expect(contributorsMap).toEqual(expected);
  });
});

describe('Testing bitbucket-cloud interaction', () => {
  test('Test fetchBitbucketCloudReposForWorkspaces', async () => {
    const bitbucketCloudInfo: BitbucketCloudTarget = {
      user: 'snyk',
      password: '123',
      workspaces: ['snyk-test'],
    };
    const repos = await bitbucketCloud.fetchBitbucketCloudReposForWorkspaces(
      bitbucketCloudInfo,
    );

    expect(repos).toEqual(
      JSON.parse(
        fs.readFileSync(fixturesFolderPath + 'snyk-test-repos.json').toString(),
      ).values,
    );
  });

  test('Test fetchBitbucketCloudContributorsForRepo', async () => {
    const bitbucketCloudInfo: BitbucketCloudTarget = {
      user: 'snyk',
      password: '123',
      workspaces: ['snyk-test'],
    };
    const contributorsMap: ContributorMap = new Map<string, Contributor>();
    const repo: Repo = {
      slug: 'testRepo1',
      workspace: {
        slug: 'snyk-test',
        uuid: '69a57492-684f-4c09-b8ba-17e03bd5e04a',
      },
      is_private: true,
    };
    await bitbucketCloud.fetchBitbucketCloudContributorsForRepo(
      bitbucketCloudInfo,
      repo,
      contributorsMap,
    );

    const expectedMap = new Map<string, Contributor>();
    expectedMap.set('{52463be6-6577-483e-9d8a-89fe2f24ccd6}', {
      contributionsCount: 2,
      email: 'snyk-test@snyk.io',
      reposContributedTo: ['snyk-test/testRepo1(Private)'],
      alternateEmails: ['other-snyk-test@snyk.io'],
      name: 'snyk test',
    });
    expectedMap.set('{acff6872-6689-4b31-b6f1-fb91f4565822}', {
      contributionsCount: 1,
      email: 'snyk-test-2@snyk.io',
      reposContributedTo: ['snyk-test/testRepo1(Private)'],
      alternateEmails: [],
      name: 'snyk test 2',
    });
    expect(contributorsMap).toEqual(expectedMap);
  });

  test('Test util pagination', async () => {
    const bitbucketCloudInfo: BitbucketCloudTarget = {
      user: 'snyk',
      password: '123',
      workspaces: ['snyk-main'],
    };
    const repos = await bitbucketCloud.fetchBitbucketCloudReposForWorkspaces(
      bitbucketCloudInfo,
    );
    const expectedRepos = JSON.parse(
      fs.readFileSync(fixturesFolderPath + 'all-repos.json').toString(),
    );

    expect(repos).toEqual(expectedRepos);
  });
});
