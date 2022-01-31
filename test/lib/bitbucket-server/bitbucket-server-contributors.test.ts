import * as nock from 'nock';
import * as fs from 'fs';
import * as path from 'path';
import * as bitbucketServer from '../../../src/lib/bitbucket-server/bitbucket-server-contributors';
import * as bitbucketServerUtils from '../../../src/lib/bitbucket-server/utils';
import {
  BitbucketServerTarget,
  Contributor,
  ContributorMap,
} from '../../../src/lib/types';
import { Repo } from '../../../src/lib/bitbucket-server/types';

const fixturesFolderPath =
  path.resolve(__dirname, '../..') + '/fixtures/bitbucket-server/';

beforeEach(() => {
  return nock('http://bitbucket-server.dev.snyk.io')
    .persist()
    .get(/.*/)
    .reply(200, (uri) => {
      switch (uri) {
        case '/rest/api/1.0/projects/AN/repos?start=0':
          return fs.readFileSync(fixturesFolderPath + 'all-AN-repos.json');
        case '/rest/api/1.0/projects/AN/repos':
          return fs.readFileSync(fixturesFolderPath + 'all-AN-repos.json');
        case '/?start=0':
          return fs.readFileSync(fixturesFolderPath + 'page1.json');
        case '/?start=1':
          return fs.readFileSync(fixturesFolderPath + 'page2.json');
        case '/90dayscutoff/?start=0':
          return fs.readFileSync(
            fixturesFolderPath + 'page1-with-90day-commit.json',
          );
        case '/rest/api/1.0/projects/AN/repos/testOrgana/commits?start=0':
          return fs.readFileSync(
            fixturesFolderPath + 'page1-with-90day-commit.json',
          );
        case '/rest/api/1.0/projects/AN/repos/TestRepoAntoine/commits?start=0':
          return fs.readFileSync(
            fixturesFolderPath + 'testRepoAntoine-commits.json',
          );
        default:
      }
    });
});

describe('Testing bitbucket-server interaction', () => {
  test('Test fetchBitbucketReposForProjects', async () => {
    const bitbucketServerInfo: BitbucketServerTarget = {
      token: '123',
      url: 'http://bitbucket-server.dev.snyk.io',
      projectKeys: ['AN'],
    };
    const repos = await bitbucketServer.fetchBitbucketReposForProjects(
      bitbucketServerInfo,
    );

    expect(repos).toEqual(
      JSON.parse(
        fs.readFileSync(fixturesFolderPath + 'all-AN-repos.json').toString(),
      ).values,
    );
  });

  test('Test fetchBitbucketContributorsForRepo', async () => {
    const bitbucketServerInfo: BitbucketServerTarget = {
      token: '123',
      url: 'http://bitbucket-server.dev.snyk.io',
      projectKeys: ['AN'],
    };
    const contributorsMap: ContributorMap = new Map<string, Contributor>();
    const repo: Repo = {
      name: 'testOrgana',
      project: {
        key: 'AN',
        name: 'antoine-snyk-demo',
      },
      public: false,
    };
    await bitbucketServer.fetchBitbucketContributorsForRepo(
      bitbucketServerInfo,
      repo,
      contributorsMap,
    );

    const expectedMap = new Map<string, Contributor>();
    expectedMap.set('aarlaud', {
      contributionsCount: 1,
      email: 'antoine@snyk.io',
      reposContributedTo: ['antoine-snyk-demo/testOrgana(Private)'],
    });
    expect(contributorsMap).toEqual(expectedMap);
  });

  test('Test fetchBitbucketContributors', async () => {
    const bitbucketServerInfo: BitbucketServerTarget = {
      token: '123',
      url: 'http://bitbucket-server.dev.snyk.io',
      projectKeys: ['AN'],
    };

    const contributorsMap: ContributorMap =
      await bitbucketServer.fetchBitbucketContributors(
        bitbucketServerInfo,
        [],
        [],
        '',
        '',
      );

    const expectedMap = new Map<string, Contributor>();
    expectedMap.set('aarlaud', {
      contributionsCount: 1,
      email: 'antoine@snyk.io',
      reposContributedTo: ['antoine-snyk-demo/testOrgana(Private)'],
    });
    expect(contributorsMap).toEqual(expectedMap);
  });

  test('Test util fetchAllPages', async () => {
    const values = await bitbucketServerUtils.fetchAllPages(
      'http://bitbucket-server.dev.snyk.io',
      '123',
    );
    const expected = JSON.parse(
      fs.readFileSync(fixturesFolderPath + 'all-AN-repos.json').toString(),
    ).values;
    expect(values).toEqual(expected);
  });
  test('Test util fetchAllPages with 90 days cutoff', async () => {
    const values = await bitbucketServerUtils.fetchAllPages(
      'http://bitbucket-server.dev.snyk.io/90dayscutoff/',
      '123',
      'tests',
      bitbucketServerUtils.isAnyCommitMoreThan90Days,
    );
    const expected = JSON.parse(
      fs
        .readFileSync(fixturesFolderPath + 'page1-with-90day-commit.json')
        .toString(),
    ).values;
    expect(values).toEqual(expected);
  });

  test('Test util isAnyCommitMoreThan90Days false', () => {
    const values = JSON.parse(
      fs
        .readFileSync(
          fixturesFolderPath +
            'commits-for-AN-testorgana-with-90d-commits.json',
        )
        .toString(),
    ).values;
    expect(bitbucketServerUtils.isAnyCommitMoreThan90Days(values)).toBeFalsy();
  });

  test('Test util isAnyCommitMoreThan90Days true', () => {
    const values = JSON.parse(
      fs
        .readFileSync(fixturesFolderPath + 'commits-for-AN-testorgana.json')
        .toString(),
    ).values;
    expect(bitbucketServerUtils.isAnyCommitMoreThan90Days(values)).toBeTruthy();
  });
});
