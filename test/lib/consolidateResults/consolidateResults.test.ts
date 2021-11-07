import * as fs from 'fs';
import * as path from 'path';
import {
  isValidFile,
  findAndUpdateContributorInArray,
  createContributorListFromFile,
  createMapFromArray,
} from '../../../src/lib/consolidateResults/utils';
import {
  ConsolidatedContributor,
  ContributorMap,
} from '../../../src/lib/consolidateResults/types';
const fixturesFolderPath =
  path.resolve(__dirname, '../..') + '/fixtures/consolidateResults/';

describe('Testing consolidateResults interaction', () => {
  test('Test isValidFile', async () => {
    const isNotValidJson = await isValidFile(
      fixturesFolderPath + 'not-json.file',
    );
    expect(isNotValidJson).toBeFalsy;
    const isValidJson = await isValidFile(
      fixturesFolderPath + 'github-enterprise-output.json',
    );
    expect(isValidJson).toBeTruthy;
  });

  test('Test findAndUpdateContributorInArray', async () => {
    const contributorFromFile: ConsolidatedContributor = {
      name: 'some name',
      contributor: {
        email: 'name@company.io',
        contributionsCount: 1,
        reposContributedTo: ['snyk-tech-services/test-repo(Public)'],
      },
    };
    const contributorList: ConsolidatedContributor[] = [
      {
        name: 'some name',
        contributor: {
          email: 'name@company.io',
          contributionsCount: 21,
          reposContributedTo: [
            'Snyk-fixtures/goof(Private)',
            'snyk-tech-services/new-repo(Private)',
          ],
        },
      },
      {
        name: 'some name',
        contributor: {
          email: 'someName@snyk.io',
          contributionsCount: 14,
          reposContributedTo: [
            'snyk-tech-services/backstage-plugin-snyk(Public)',
            'snyk-tech-services/snyk-api-ts-client(Public)',
            'snyk-tech-services/snyk-delta(Public)',
            'snyk-tech-services/snyk-disallow(Public)',
            'snyk-tech-services/snyk-filter(Public)',
            'snyk-tech-services/snyk-licenses-texts(Public)',
            'snyk-tech-services/snyk-request-manager(Public)',
          ],
        },
      },
    ];
    const desiredContributor: ConsolidatedContributor = {
      name: 'some name',
      contributor: {
        email: 'name@company.io',
        contributionsCount: 22,
        reposContributedTo: [
          'snyk-tech-services/test-repo(Public)',
          'Snyk-fixtures/goof(Private)',
          'snyk-tech-services/new-repo(Private)',
        ],
      },
    };
    const UpdatedContributor: ConsolidatedContributor =
      await findAndUpdateContributorInArray(
        contributorFromFile,
        contributorList,
      );
    expect(UpdatedContributor).toEqual(desiredContributor);
  });
  test('Test isValidFile', async () => {
    const fileContent = fs.readFileSync(
      fixturesFolderPath + 'github-enterprise-output.json',
    );
    const contributorsFromFile: ConsolidatedContributor[] =
      await createContributorListFromFile(fileContent);
    const ExpectedContributors: ConsolidatedContributor[] = [
      {
        name: 'ghe',
        contributor: {
          email: 'ghe@snyk.io',
          contributionsCount: 4,
          reposContributedTo: [
            'snyk-fixtures/goof(Public)',
            'snyk-test/repo-tests(Public)',
          ],
        },
      },
      {
        name: 'some name',
        contributor: {
          email: 'name@company.io',
          contributionsCount: 22,
          reposContributedTo: [
            'snyk-tech-services/test-repo(Public)',
            'Snyk-fixtures/goof(Private)',
            'snyk-tech-services/new-repo(Private)',
          ],
        },
      },
    ];
    expect(contributorsFromFile).toEqual(ExpectedContributors);
  });
  test('Test createMapFromArray', async () => {
    const contributorsArray: ConsolidatedContributor[] = [
      {
        name: 'ghe',
        contributor: {
          email: 'ghe@snyk.io',
          contributionsCount: 4,
          reposContributedTo: [
            'snyk-fixtures/goof(Public)',
            'snyk-test/repo-tests(Public)',
          ],
        },
      },
      {
        name: 'some name',
        contributor: {
          email: 'name@company.io',
          contributionsCount: 22,
          reposContributedTo: [
            'snyk-tech-services/test-repo(Public)',
            'Snyk-fixtures/goof(Private)',
            'snyk-tech-services/new-repo(Private)',
          ],
        },
      },
    ];
    const mapFromArray: ContributorMap = await createMapFromArray(
      contributorsArray,
    );
    expect(mapFromArray.size).toEqual(2);
  });
});
