import * as nock from 'nock';
import * as fs from 'fs';
import * as path from 'path';
import * as bitbucketCloud from '../../../src/lib/bitbucket-cloud/bitbucket-cloud-contributors';
import * as bitbucketCloudUtils from '../../../src/lib/bitbucket-cloud/utils';
import {
  BitbucketCloudTarget,
  Contributor,
  ContributorMap,
} from '../../../src/lib/types';
import { Repo } from '../../../src/lib/bitbucket-cloud/types';

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
    expectedMap.set('snyk-test@snyk.io', {
      contributionsCount: 1,
      email: 'snyk-test@snyk.io',
      reposContributedTo: ['snyk-test/testRepo1'],
    });
    expectedMap.set('snyk test', {
      contributionsCount: 1,
      email: 'snyk-test@snyk.io',
      reposContributedTo: ['snyk-test/testRepo1'],
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
