import * as nock from 'nock';
import * as fs from 'fs';
import * as path from 'path';
import * as snyk from '../../../src/lib/snyk';

const fixturesFolderPath = path.resolve(__dirname, '../..') + '/fixtures/snyk/';

beforeEach(() => {
  return nock('https://snyk.io')
    .persist()
    .get(/.*/)
    .reply(200, (uri) => {
      switch (uri) {
        case '/api/v1/orgs':
          return fs.readFileSync(fixturesFolderPath + 'list-all-orgs.json');
        default:
      }
    })
    .post(/.*/)
    .reply(200, (uri) => {
      switch (uri) {
        case '/api/v1/org/689ce7f9-7943-4a71-b704-2ba575f01088/projects':
          return fs.readFileSync(
            fixturesFolderPath +
              'list-all-projects-for-defaultOrg-cli-only.json',
          );
        case '/api/v1/org/689ce7f9-7943-4a71-b704-2ba575f01089/projects':
          return fs.readFileSync(
            fixturesFolderPath +
              'list-all-projects-for-defaultOrg-scm-only.json',
          );
        case '/api/v1/org/a04d9cbd-ae6e-44af-b573-0556b0ad4bd2/projects':
          return fs.readFileSync(
            fixturesFolderPath + 'list-all-projects-for-my-other-org.json',
          );
        default:
      }
    });
});

describe('Testing snyk lib functions', () => {
  test('Retrieve Snyk monitored repos - bitbucket-server project', async () => {
    const orgs: snyk.OrgType[] = [
      {
        name: 'defaultOrg',
        id: '689ce7f9-7943-4a71-b704-2ba575f01089',
        slug: 'default-org',
        url: 'https://api.snyk.io/org/default-org',
        group: null,
      },
    ];
    expect(
      await snyk.retrieveMonitoredReposBySourceType(
        orgs,
        snyk.SourceType['bitbucket-server'],
        'http://123',
      ),
    ).toEqual(['jeff-snyk-demo/java-goof']);
  });

  test('Retrieve Snyk monitored repos - CLI projects mismatching SCM hostname', async () => {
    const orgs: snyk.OrgType[] = [
      {
        name: 'defaultOrg1',
        id: '689ce7f9-7943-4a71-b704-2ba575f01088',
        slug: 'default-org2',
        url: 'https://api.snyk.io/org/default-org1',
        group: null,
      },
    ];
    expect(
      await snyk.retrieveMonitoredReposBySourceType(
        orgs,
        snyk.SourceType['cli'],
        'http://123',
      ),
    ).toEqual([]);
  });

  test('Retrieve Snyk monitored repos - CLI projects matching SCM hostname', async () => {
    const orgs: snyk.OrgType[] = [
      {
        name: 'defaultOrg1',
        id: '689ce7f9-7943-4a71-b704-2ba575f01088',
        slug: 'default-org1',
        url: 'https://api.snyk.io/org/default-org1',
        group: null,
      },
    ];
    expect(
      await snyk.retrieveMonitoredReposBySourceType(
        orgs,
        snyk.SourceType['cli'],
        'http://bitbucket-server.dev.snyk.io',
      ),
    ).toEqual(['http://bitbucket-server.dev.snyk.io/scm/an/testorgana.git']);
  });

  // TODO: See how to mock Snyk API better to honor filters passed in requestBody

  //   test('Retrieve Snyk monitored repos - CLI projects mismatching SCM hostname', async () => {
  //     expect(
  //       await snyk.retrieveMonitoredRepos(
  //         'http://123',
  //         snyk.SourceType['bitbucket-server'],
  //       ),
  //     ).toEqual([
  //       'jeff-snyk-demo/java-goof',
  //       'snyk-tech-services/training-snyk-row',
  //     ]);
  //   });

  //   test('Retrieve Snyk monitored repos - CLI projects matching SCM hostname', async () => {
  //     expect(
  //       await snyk.retrieveMonitoredRepos(
  //         'http://bitbucket-server.dev.snyk.io',
  //         snyk.SourceType['bitbucket-server'],
  //       ),
  //     ).toEqual([
  //       'jeff-snyk-demo/java-goof',
  //       'http://bitbucket-server.dev.snyk.io/scm/an/testorgana.git',
  //       'snyk-tech-services/training-snyk-row',
  //     ]);
  //   });
});
