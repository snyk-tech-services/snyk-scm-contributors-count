import * as utils from '../../../src/lib/common';

describe('Testing utils functions', () => {
  test('Test hash function', () => {
    expect(utils.hashData('antoine@snyk.io')).toEqual(
      '53427c999df1b032e80ab13da0df88bd071ab89f',
    );
  });
});
