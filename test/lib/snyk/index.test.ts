import * as nock from 'nock';
import * as path from 'path';
import * as snyk from '../../../src/lib/snyk';
import {
  listAllTargetCliOnly,
  listAllTargetsScmOnly,
} from '../../fixtures/snyk/targetMock';
import { snykApiVersion } from '../../../src/lib/snyk';

beforeEach(() => {
  return nock(/.*/)
    .persist()
    .get(/.*/)
    .reply(200, (uri) => {
      switch (uri) {
        case `/rest/orgs/689ce7f9-7943-4a71-b704-2ba575f01088/targets?origin=cli&version=${snykApiVersion}`:
          return listAllTargetCliOnly;
        case `/rest/orgs/689ce7f9-7943-4a71-b704-2ba575f01089/targets?origin=bitbucket-server&version=${snykApiVersion}`:
          return listAllTargetsScmOnly;
        default:
      }
    });
});

describe('Testing snyk lib functions', () => {
  test('Retrieve Snyk monitored repos - bitbucket-server project', async () => {
    const orgs: snyk.OrgType[] = [
      {
        id: '689ce7f9-7943-4a71-b704-2ba575f01089',
        type: 'org',
        attributes: {
          name: 'defaultOrg',
          slug: 'default-org',
          group: null,
          is_personal: false,
        },
      },
    ];

    const response = await snyk.retrieveMonitoredReposBySourceType(
      orgs,
      snyk.SourceType['bitbucket-server'],
      'http://123',
    );

    expect(response).toEqual(['test-snyk', 'test-snyk-2', 'test-snyk-3']);
  });

  test('Retrieve Snyk monitored repos - CLI projects mismatching SCM hostname', async () => {
    const orgs: snyk.OrgType[] = [
      {
        type: 'org',
        id: '689ce7f9-7943-4a71-b704-2ba575f01088',
        attributes: {
          name: 'defaultOrg1',
          slug: 'default-org2',
          group: null,
          is_personal: false,
        },
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
        id: '689ce7f9-7943-4a71-b704-2ba575f01088',
        type: 'org',
        attributes: {
          name: 'defaultOrg1',
          slug: 'default-org1',
          group: null,
          is_personal: false,
        },
      },
    ];
    expect(
      await snyk.retrieveMonitoredReposBySourceType(
        orgs,
        snyk.SourceType['cli'],
        'https://not-a-real-url',
      ),
    ).toEqual(['test-snyk', 'test-snyk-2']);
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
