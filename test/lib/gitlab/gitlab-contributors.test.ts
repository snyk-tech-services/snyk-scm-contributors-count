import * as nock from 'nock';
import * as fs from 'fs';
import * as path from 'path';
import * as gitlab from '../../../src/lib/gitlab/gitlab-contributors';
import {
  GitlabTarget,
  Contributor,
  ContributorMap,
} from '../../../src/lib/types';

const fixturesFolderPath =
  path.resolve(__dirname, '../..') + '/fixtures/gitlab/';

jest.setTimeout(50000);

beforeEach(() => {
  return nock('https://gitlab.dev.com/')
    .persist()
    .get(/.*/)
    .reply(200, (uri) => {
      console.log('URI = ' + uri);
      switch (uri) {
        case '/api/v4/user':
          return fs.readFileSync(fixturesFolderPath + 'testUser.json');
        case '/api/v4/projects?per_page=100':
          return fs.readFileSync(fixturesFolderPath + 'testProjects.json');
        case '/api/v4/projects/10434/repository/commits?id=10434&page=2&per_page=100':
          return fs.readFileSync(
            fixturesFolderPath + 'testProjects-commits-nextPage.json',
          );
        case '/api/v4/groups?all_available=true&search=test-group':
          return fs.readFileSync(fixturesFolderPath + 'testGroup.json');
        default:
      }
    });
});

beforeEach(() => {
  return nock('https://gitlab.dev.io/')
    .persist()
    .get(/.*/)
    .reply(
      200,
      (uri) => {
        console.log('URI = ' + uri);
        switch (uri) {
          case '/api/v4/projects/TechServices%2FtestProject/repository/commits?since=2021-06-01T00:00:01Z&per_page=100':
            return fs.readFileSync(
              fixturesFolderPath + 'testProjects-commits-nextPage.json',
            );
          default:
        }
      },
      {
        link: '<http://gitlab.dev.com:443/api/v4/projects/10434/repository/commits?id=10434&page=2&per_page=100>; rel="next", <http://gitlab.dev.com:443/api/v4/projects/10434/repository/commits?id=10434&page=1&per_page=100>; rel="first", <http://gitlab.dev.com:443/api/v4/projects/10434/repository/commits?id=10434&page=2&per_page=100>; rel="last"',
      },
    );
});

describe('Testing gitlab interaction', () => {
  test('Test fetchGitlabProjects', async () => {
    const gitlabInfo: GitlabTarget = {
      token: '123',
      url: 'https://gitlab.dev.io/',
    };
    const projects = await gitlab.fetchGitlabProjects(
      'https://gitlab.dev.com/',
      gitlabInfo,
    );
    expect(projects).toHaveLength(2);
    expect(projects[0].path_with_namespace).toEqual(
      'TechServices/DotNetFrameworkSampleCLIApp',
    );
    expect(projects[1].id).toEqual(10437);
    expect(projects[0]).not.toEqual(projects[1]);
  });

  test('Test fetchGitlabContributorsForProject', async () => {
    const gitlabInfo: GitlabTarget = {
      token: '123',
      url: 'https://gitlab.dev.io/',
      groups: [],
      project: 'TechServices/testProject',
    };
    const contributorsMap: ContributorMap =
      await gitlab.fetchGitlabContributors(
        gitlabInfo,
        [],
        '2021-06-01T00:00:01Z',
      );

    const expectedMap = new Map<string, Contributor>();
    expectedMap.set('Tech Services', {
      contributionsCount: 14,
      email: 'tech.services@snyk.io',
      reposContributedTo: ['TechServices/testProject(undefined)'],
    });
    expect(contributorsMap).toEqual(expectedMap);
  });

  test('Test findGroupPaths', async () => {
    const groups = await gitlab.findGroupPaths(
      'https://gitlab.dev.com/',
      '1234',
      'test-group',
    );
    expect(groups).toHaveLength(1);
    expect(groups[0].full_path).toEqual('top-level/sub-level1/testGroup');
  });
});
