import * as fs from 'fs';
import * as path from 'path';
import * as utils from '../../../src/lib/common';

const fixturesFolderPath =
  path.resolve(__dirname, '../..') + '/fixtures/utils/';

describe('Testing utils function', () => {
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
});
