import * as nock from 'nock';
import * as fs from 'fs';
import * as path from 'path';
import * as azureDevops from '../../../src/lib/azure-devops/azure-devops-contributors';
import {
  AzureDevopsTarget,
  Contributor,
  ContributorMap,
} from '../../../src/lib/types';
import { Repo } from '../../../src/lib/azure-devops/types';

const fixturesFolderPath =
  path.resolve(__dirname, '../..') + '/fixtures/azure-devops/';

beforeEach(() => {
  return nock('https://dev.azure.com')
    .persist()
    .get(/.*/)
    .reply(200, (uri) => {
      console.log('URI = ' + uri);
      switch (uri) {
        case '/testOrg/testProject/_apis/git/repositories?$top=1000000&api-version=4.1':
          return fs.readFileSync(fixturesFolderPath + 'project-repos.json');
        case '/testOrg/5ce02f49-7e0e-4aba-9c24-3428111da778/_apis/git/repositories/testRepo1/commits?$top=1000000&searchCriteria.fromDate=2000/01/01%2012:00&api-version=4.1':
          return fs.readFileSync(fixturesFolderPath + 'testRepo-commits.json');
        case '/testOrg/5ce02f49-7e0e-4aba-9c24-3428111da778/_apis/git/repositories/goof.git/commits?$top=1000000&searchCriteria.fromDate=2000/01/01%2012:00&api-version=4.1':
          return fs.readFileSync(fixturesFolderPath + 'goofRepo-commits.json');
        case '/testOrg/_apis/projects?$top=1000000&api-version=4.1':
          return fs.readFileSync(fixturesFolderPath + 'org-projects.json');
        default:
      }
    });
});

describe('Testing azure-devops interaction', () => {
  test('Test fetchAzureProjects', async () => {

    const projects = await azureDevops.fetchAzureProjects('https://dev.azure.com', 'testOrg', '123');
    expect(projects).toHaveLength(10);
    expect(projects[0].name).toEqual('Test68');
    expect(projects[1].id).toEqual('5bdff632-3ff7-4378-9d25-1c6355885b0f',
    );
    expect(projects[0]).not.toEqual(projects[1]);
  });

  test('Test fetchAzureReposForProjects', async () => {
    const azureDevopsInfo: AzureDevopsTarget = {
      token: '123',
      OrgName: 'testOrg',
      projectKeys: ['testProject'],
    };
    const repos = await azureDevops.fetchAzureReposForProjects(azureDevopsInfo);
    expect(repos).toHaveLength(2);
    expect(repos[0].name).toEqual('testRepo1');
    expect(repos[1].project.key).toEqual(
      '5ce02f49-7e0e-4aba-9c24-3428111da778',
    );
    expect(repos[0]).not.toEqual(repos[1]);
  });

  test('Test fetchAzureContributorsForRepo', async () => {
    const azureDevopsInfo: AzureDevopsTarget = {
      token: '123',
      OrgName: 'testOrg',
      projectKeys: ['testProject'],
    };
    const contributorsMap: ContributorMap = new Map<string, Contributor>();
    const repo: Repo = {
      name: 'testRepo1',
      project: {
        key: '5ce02f49-7e0e-4aba-9c24-3428111da778',
        name: 'testProject1',
      },
      public: false,
    };
    await azureDevops.fetchAzureContributorsForRepo(
      azureDevopsInfo,
      repo,
      contributorsMap,
      '2000/01/01 12:00',
    );

    const expectedMap = new Map<string, Contributor>();
    expectedMap.set('Ilan Torbaty', {
      contributionsCount: 4,
      email: 'ilan.torbaty@snyk.io',
      reposContributedTo: ['testProject1/testRepo1'],
    });
    expect(contributorsMap).toEqual(expectedMap);
  });

  test('Test fetchAzureDevopsContributors', async () => {
    const azureDevopsInfo: AzureDevopsTarget = {
      token: '123',
      OrgName: 'testOrg',
      projectKeys: ['testProject'],
    };

    const contributorsMap: ContributorMap =
      await azureDevops.fetchAzureDevopsContributors(
        azureDevopsInfo,
        [],
        '2000/01/01 12:00',
      );

    const expectedMap = new Map<string, Contributor>();
    expectedMap.set('Ilan Torbaty', {
      contributionsCount: 4,
      email: 'ilan.torbaty@snyk.io',
      reposContributedTo: ['testProject1/testRepo1'],
    });
    expectedMap.set('testUser', {
      contributionsCount: 37,
      email: 'testUser@snyk.io',
      reposContributedTo: ['testProject1/goof.git'],
    });
    expect(contributorsMap).toEqual(expectedMap);
  });
});
