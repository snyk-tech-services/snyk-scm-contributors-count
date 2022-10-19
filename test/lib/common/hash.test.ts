import * as utils from '../../../src/lib/common';

describe('Testing utils functions', () => {
  test('Test hash function', () => {
    expect(utils.hashData('antoine@snyk.io')).toEqual(
      '0c372a7421f9b634f4e67385e8b720a914af82bd10dcb8ec01e42b8439b193aa',
    );
  });
});
