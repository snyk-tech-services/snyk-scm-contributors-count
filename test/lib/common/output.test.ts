import { stdin, MockSTDIN } from 'mock-stdin';
import * as utils from '../../../src/lib/common';

import { Contributor, ContributorMapWithSummary } from '../../../src/lib/types';

const stdinMock: MockSTDIN = stdin();

const originalLog = console.log;
let consoleOutput: Array<string> = [];
const mockedLog = (output: string): void => {
  consoleOutput.push(output);
};
beforeAll(() => {
  console.log = mockedLog;
});
afterEach(() => {
  stdinMock.reset();
});

beforeEach(() => {
  consoleOutput = [];
});
afterAll(() => {
  setTimeout(() => {
    console.log = originalLog;
  }, 500);
});

describe('Testing output functions', () => {
  test('Test output function - no json', () => {
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

    /* eslint-disable no-useless-escape */

    const output = [
      '#### Summary',
      'Contributors Count: 2',
      'Repository Count: 4',
      'Exclusion Count: 0',
      '### Details:',
      '## Repository List',
      'antoine-snyk-demo/testOrgana',
      'antoine-snyk-demo/xyz',
      'antoine-snyk-demo/TestRepoAntoine',
      'project/repo',
      `## Contributors details,[`,
      `[`,
      `\"aarlaud\"`,
      `{`,
      `\"contributionsCount\": 10`,
      `\"email\": \"antoine@snyk.io\"`,
      `\"reposContributedTo\": [`,
      `\"antoine-snyk-demo/testOrgana\",`,
      `\"antoine-snyk-demo/xyz\",`,
      `\"antoine-snyk-demo/TestRepoAntoine\"`,
      `]`,
      `}`,
      `],`,
      `[`,
      `\"snyk\",`,
      `{`,
      `\"contributionsCount\": 100,`,
      `\"email\": \"snyk@snyk.io\",`,
      `\"reposContributedTo\": [`,
      `\"project/repo\"`,
      `]`,
      `}`,
      `]`,
      `]`,
    ];
    /* eslint-enable no-useless-escape */

    utils.printOutResults(resultsWithStats);
    output.forEach((line: string) => {
      expect(consoleOutput.join()).toContain(line);
    });
    // expect(consoleOutput).toEqual(output);
  });
});
