import * as nock from 'nock';
import * as snyk from '../../../src/lib/snyk';
import {
  listAllTargetCliOnly,
  listAllTargetsScmOnly,
  listTargetsLastPage,
  listTargetsWithNextPage,
} from '../../fixtures/snyk/targetMock';
import { getAllOrgs, snykApiVersion } from '../../../src/lib/snyk';

beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const listOrgsFirstPage = require('../../fixtures/snyk/all-orgs-page1-rest.json');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const listOrgsSecondPage = require('../../fixtures/snyk/all-orgs-page2-rest.json');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const listOrgsLastPage = require('../../fixtures/snyk/all-orgs-pagelast-rest.json');
  return nock(/.*/)
    .persist()
    .get(/.*/)
    .reply(200, (uri) => {
      switch (uri) {
        case `/rest/orgs/689ce7f9-7943-4a71-b704-2ba575f01088/targets?limit=100&origin=cli&version=${snykApiVersion}`:
          return listAllTargetCliOnly;
        case `/rest/orgs/689ce7f9-7943-4a71-b704-2ba575f01089/targets?limit=100&origin=bitbucket-server&version=${snykApiVersion}`:
          return listAllTargetsScmOnly;
        case `/rest/orgs/39ab9ba8-96e4-41b5-8494-4fe31bf8907a/targets?limit=100&origin=bitbucket-server&version=${snykApiVersion}`:
          return listTargetsWithNextPage;
        case `/rest/orgs/39ab9ba8-96e4-41b5-8494-4fe31bf8907a/targets?limit=100&origin=bitbucket-server&version=${snykApiVersion}&starting_after=doesnt-matter`:
          return listTargetsLastPage;
        case `/rest/orgs?version=${snykApiVersion}&limit=10`:
          return listOrgsFirstPage;
        case `/rest/orgs?limit=10&starting_after=v1.eyJuYW1lIjoiMjlhNDJhMjItMzY3ZS00NzIzLTljNTAtNGI0MzIxYjM2ZjcxIiwic2x1ZyI6IjI5YTQyYTIyLTM2N2UtNDcyMy05YzUwLTRiNDMyMWIzNmY3MSJ9&version=2023-09-29~beta`:
          return listOrgsSecondPage;
        case `/rest/orgs?limit=10&starting_after=v1.eyJuYW1lIjoiNTIzYjM3N2ItY2MyNC00NDA2LWEwMmQtMGIwMmJhODE5ZGYxIiwic2x1ZyI6IjUyM2IzNzdiLWNjMjQtNDQwNi1hMDJkLTBiMDJiYTgxOWRmMSJ9&version=2023-09-29~beta`:
          return listOrgsLastPage;
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

  test('Retrieve Snyk monitored repos with pagination - bitbucket-server project', async () => {
    const orgs: snyk.OrgType[] = [
      {
        id: '39ab9ba8-96e4-41b5-8494-4fe31bf8907a',
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

    expect(response).toEqual(['test-snyk-first-page', 'test-snyk-last-page']);
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

  test('Test retrieval of all orgs with pagination', async () => {
    const orgs = await getAllOrgs();
    console.log(orgs);
    expect(orgs.length).toEqual(30);
    // first org on first page org
    expect(
      orgs.some((org) => org.id == '2aca25e4-6bcc-4ed5-ad16-1f00f08984ed'),
    ).toBeTruthy();
    // last org on last page
    expect(
      orgs.some((org) => org.id == 'acacadb8-3236-42c3-b7d3-36f4847cf902'),
    ).toBeTruthy();
  });
});
