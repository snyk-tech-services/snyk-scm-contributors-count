import * as fs from 'fs';
import * as path from 'path';
import * as exclusion from '../../../src/lib/common/exclusion';
import * as utils from '../../../src/lib/common/utils';

const fixturesFolderPath =
  path.resolve(__dirname, '../..') + '/fixtures/exclusion/';

describe('Testing exclusion function', () => {
  test('Loading list from file', () => {
    const list = JSON.parse(
      fs.readFileSync(fixturesFolderPath + 'exclusionList.json').toString(),
    );

    const loadedList = exclusion.loadListFromFile(
      fixturesFolderPath + 'snyk.exclude',
    );

    expect(loadedList).toEqual(list);
  });

  test('Excluding contributors by email from map', () => {
    const unexcludedContributorMap = utils.serializeMapFromJson(
      fs
        .readFileSync(fixturesFolderPath + 'unexcludedContributorsMap.json')
        .toString(),
    );

    const excludedContributorMap = utils.serializeMapFromJson(
      fs
        .readFileSync(fixturesFolderPath + 'excludedContributorsMap.json')
        .toString(),
    );

    expect(
      exclusion.excludeFromListByEmail(
        unexcludedContributorMap,
        fixturesFolderPath + 'snyk.exclude',
      ),
    ).toEqual(excludedContributorMap);
  });
});
