import * as fs from 'fs';
import * as path from 'path';
import * as utils from '../../../src/lib/common';
import { Contributor, ContributorMapWithSummary } from '../../../src/lib/types';

const fixturesFolderPath =
  path.resolve(__dirname, '../..') + '/fixtures/utils/';

describe('Testing utils functions', () => {
  test('Dedupping repos', () => {
    const duppedList = JSON.parse(
      fs.readFileSync(fixturesFolderPath + 'duppedRepoList.json').toString(),
    );
    const deduppedList = JSON.parse(
      fs.readFileSync(fixturesFolderPath + 'deduppedRepoList.json').toString(),
    );
    expect(utils.dedupRepos(duppedList)).toEqual(deduppedList);
  });

  test('Dedupping contributors map', () => {
    const duppedMapJson = fs
      .readFileSync(fixturesFolderPath + 'duppedContributorsMap.json')
      .toString();
    const deduppedMapJson = fs
      .readFileSync(fixturesFolderPath + 'deduppedContributorsMap.json')
      .toString();
    const duppedMap = utils.serializeMapFromJson(duppedMapJson);
    const deduppedMap = utils.serializeMapFromJson(deduppedMapJson);
    expect(utils.dedupContributorsByEmail(duppedMap)).toEqual(deduppedMap);
  });

  test('CalculateSummaryStats', () => {
    const deduppedMapJson = fs
      .readFileSync(fixturesFolderPath + 'deduppedContributorsMap.json')
      .toString();
    const deduppedMap = utils.serializeMapFromJson(deduppedMapJson);

    const resultsMap = new Map<string, Contributor>();
    resultsMap.set('aarlaud', {
      contributionsCount: 10,
      email: 'antoine@snyk.io',
      reposContributedTo: [
        'antoine-snyk-demo/testOrgana',
        'antoine-snyk-demo/xyz',
        'antoine-snyk-demo/TestRepoAntoine',
      ],
    });
    resultsMap.set('snyk', {
      contributionsCount: 100,
      email: 'snyk@snyk.io',
      reposContributedTo: ['project/repo'],
    });
    const resultsWithStats: ContributorMapWithSummary = {
      contributorsCount: 2,
      contributorsDetails: resultsMap,
      exclusionCount: 0,
      repoCount: 4,
      repoList: [
        'antoine-snyk-demo/testOrgana',
        'antoine-snyk-demo/xyz',
        'antoine-snyk-demo/TestRepoAntoine',
        'project/repo',
      ],
    };

    expect(utils.calculateSummaryStats(deduppedMap, 0)).toEqual(
      resultsWithStats,
    );
  });

  test('returnKeyIfEmailFoundInMap', () => {
    const deduppedMapJson = fs
      .readFileSync(fixturesFolderPath + 'deduppedContributorsMap.json')
      .toString();
    const deduppedMap = utils.serializeMapFromJson(deduppedMapJson);

    expect(
      utils.returnKeyIfEmailFoundInMap(deduppedMap, 'antoine@snyk.io'),
    ).toEqual('aarlaud');
  });

  test('getUniqueReposFromMap', () => {
    const deduppedMapJson = fs
      .readFileSync(fixturesFolderPath + 'deduppedContributorsMap.json')
      .toString();
    const deduppedMap = utils.serializeMapFromJson(deduppedMapJson);
    const repoList = [
      'antoine-snyk-demo/testOrgana',
      'antoine-snyk-demo/xyz',
      'antoine-snyk-demo/TestRepoAntoine',
      'project/repo',
    ];

    expect(utils.getUniqueReposFromMap(deduppedMap)).toEqual(repoList);
  });

  test('createImportFile', () => {
    const deduppedMapJson = fs
      .readFileSync(fixturesFolderPath + 'deduppedContributorsMap.json')
      .toString();
    const deduppedMap = utils.serializeMapFromJson(deduppedMapJson);
    const repoList = [
      'antoine-snyk-demo/testOrgana',
      'antoine-snyk-demo/xyz',
      'antoine-snyk-demo/TestRepoAntoine',
      'project/repo',
    ];

    expect(utils.getUniqueReposFromMap(deduppedMap)).toEqual(repoList);
  });
});
