import * as nock from 'nock';
import * as fs from 'fs';
import * as path from 'path';
import * as ghe from '../../../src/lib/github-enterprise/github-enterprise-contributors';
import {
  GithubEnterpriseTarget,
  Contributor,
  ContributorMap,
} from '../../../src/lib/types';

const fixturesFolderPath =
  path.resolve(__dirname, '../..') + '/fixtures/github-enterprise/';

jest.setTimeout(50000);

beforeEach(() => {
  return nock('https://ghe.company.com/')
    .persist()
    .get(/.*/)
    .reply(200, (uri) => {
      console.log('URI = ' + uri);
      switch (uri) {
        case '/api/v3/user/orgs?per_page=100':
          return fs.readFileSync(
            fixturesFolderPath + 'github-enterprise-orgs.json',
          );
        case '/api/v3/orgs/snyk-fixtures/repos?per_page=100&sort=full_name&page=2':
          return fs.readFileSync(
            fixturesFolderPath + 'github-enterprise-repos-second-page.json',
          );
        case '/api/v3/organizations?per_page=100':
          return fs.readFileSync(
            fixturesFolderPath + 'github-enterprise-allOrgs.json',
          );
        case '/api/v3/orgs/tech-services/repos?per_page=100&sort=full_name':
          return fs.readFileSync(
            fixturesFolderPath + 'github-enterprise-allOrgs-repos.json',
          );
        case `/api/v3/repos/tech-services/goof/commits?per_page=100&since=2021-06-01T00:00:01Z`:
          return fs.readFileSync(
            fixturesFolderPath + 'github-enterprise-repo-commits.json',
          );
        default:
      }
    });
});

beforeEach(() => {
  return nock('https://test.ghe.company.com/')
    .persist()
    .get(/.*/)
    .reply(
      200,
      (uri) => {
        console.log('URI = ' + uri);
        switch (uri) {
          case '/api/v3/orgs/snyk-fixtures/repos?per_page=100&sort=full_name':
            return fs.readFileSync(
              fixturesFolderPath + 'github-enterprise-repos.json',
            );
          default:
        }
      },
      {
        link: '<http://ghe.company.com/api/v3/orgs/snyk-fixtures/repos?per_page=100&sort=full_name&page=2>; rel="next", <http://test.ghe.company.com/api/v3/orgs/snyk-fixtures/repos?per_page=100&sort=full_name>; rel="first", <http://ghe.company.com/api/v3/orgs/snyk-fixtures/repos?per_page=100&sort=full_name&page=2>; rel="last"',
      },
    );
});

describe('Testing github-enterprise interaction', () => {
  test('Test fetchGithubEnterpriseOrgs', async () => {
    const orgs = await ghe.fetchGithubEnterpriseOrgs(
      'https://ghe.company.com/api/v3/user/orgs?per_page=100',
      'testToken',
    );
    expect(orgs).toHaveLength(4);
    expect(orgs[0].login).toEqual('snyk-fixtures');
    expect(orgs[1].login).toEqual('snyk-test');
    expect(orgs[0]).not.toEqual(orgs[1]);
  });

  test('Test fetchGithubEnterpriseReposForOrgs', async () => {
    const gheInfo: GithubEnterpriseTarget = {
      token: 'testToken',
      url: 'https://test.ghe.company.com',
      orgs: ['snyk-fixtures'],
    };
    const repos = await ghe.fetchGithubEnterpriseReposForOrgs(gheInfo);
    expect(repos).toHaveLength(9);
    expect(repos[0].private).toBeFalsy;
    expect(repos[1].name).toEqual('shallow-goof');
    expect(repos[4]).not.toEqual(repos[3]);
    expect(repos[5].name).toEqual('so');
    expect(repos[6].name).toEqual('now');
    expect(repos[7].name).toEqual('you');
    expect(repos[8].name).toEqual('know');
  });

  test('Test fetchGithubEnterpriseContributorsForRepo', async () => {
    const gheInfo: GithubEnterpriseTarget = {
      token: 'testToken',
      url: 'https://ghe.company.com',
      fetchAllOrgs: true,
    };
    const contributorsMap: ContributorMap =
      await ghe.fetchGithubEnterpriseContributors(
        gheInfo,
        [],
        [],
        '',
        '',
        '2021-06-01T00:00:01Z',
      );

    const expectedMap = new Map<string, Contributor>();
    expectedMap.set('Tech Services', {
      contributionsCount: 2,
      email: 'techservices@snyk.com',
      reposContributedTo: ['tech-services/goof(Public)'],
    });
    expect(contributorsMap).toEqual(expectedMap);
  });
});
