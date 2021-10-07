import * as nock from 'nock';
import * as fs from 'fs';
import * as path from 'path';
import * as github from '../../../src/lib/github/github-contributors';
import {
  GithubTarget,
  Contributor,
  ContributorMap,
} from '../../../src/lib/types';

const fixturesFolderPath =
  path.resolve(__dirname, '../..') + '/fixtures/github/';

jest.setTimeout(50000);

beforeEach(() => {
  return nock('https://test.api.github.com/')
    .persist()
    .get(/.*/)
    .reply(200, (uri) => {
      console.log('URI = ' + uri);
      switch (uri) {
        case '/user/orgs?per_page=100&page=2':
          return fs.readFileSync(
            fixturesFolderPath + 'github-orgs-second-page.json',
          );
        case '/orgs/snyk/repos?per_page=100&sort=full_name':
          return fs.readFileSync(fixturesFolderPath + 'github-repos.json');
        case '/repos/snyk/module/commits?per_page=100&since=2021-06-01T00:00:01Z':
          return fs.readFileSync(
            fixturesFolderPath + 'github-repo-commits.json',
          );
        default:
      }
    });
});

beforeEach(() => {
  return nock('https://github.dev.io/')
    .persist()
    .get(/.*/)
    .reply(
      200,
      (uri) => {
        console.log('URI = ' + uri);
        switch (uri) {
          case '/user/orgs?per_page=100':
            return fs.readFileSync(fixturesFolderPath + 'github-orgs.json');
          default:
        }
      },
      {
        link: '<http://test.api.github.com/user/orgs?per_page=100&page=2>; rel="next", <http://github.dev.io/user/orgs?per_page=100&page=1>; rel="first", <http://test.api.github.com/user/orgs?per_page=100&page=2>; rel="last"',
      },
    );
});

describe('Testing github interaction', () => {
  test('Test fetchGithubOrgs', async () => {
    const orgs = await github.fetchGithubOrgs(
      'https://github.dev.io/user/orgs?per_page=100',
      'testToken',
    );
    expect(orgs).toHaveLength(4);
    expect(orgs[0].login).toEqual('snyk');
    expect(orgs[1].login).toEqual('snyk-tech-services');
    expect(orgs[3].login).toEqual('snyk-tech-services-test');
    expect(orgs[0]).not.toEqual(orgs[1]);
    expect(orgs[2]).toHaveProperty('login');
  });

  test('Test fetchGithubReposForOrgs', async () => {
    const githubInfo: GithubTarget = { token: 'testToken', orgs: ['snyk'] };
    const repos = await github.fetchGithubReposForOrgs(githubInfo);
    expect(repos).toHaveLength(3);
    expect(repos[0].private).toBeTruthy;
    expect(repos[1].name).toEqual('module');
    expect(repos[2]).not.toEqual(repos[0]);
  });

  test('Test fetchGithubContributorsForRepo', async () => {
    const githubInfo: GithubTarget = {
      token: '123',
      orgs: ['snyk'],
      repo: 'module',
    };
    const contributorsMap: ContributorMap =
      await github.fetchGithubContributors(
        githubInfo,
        [],
        '2021-06-01T00:00:01Z',
      );

    const expectedMap = new Map<string, Contributor>();
    expectedMap.set('Tech Services', {
      contributionsCount: 2,
      email: 'techservices@snyk.com',
      reposContributedTo: ['snyk/module(Public)'],
    });
    expect(contributorsMap).toEqual(expectedMap);
  });
});
