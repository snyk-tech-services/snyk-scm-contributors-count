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
        'antoine-snyk-demo/testOrgana(private)',
        'antoine-snyk-demo/xyz(private)',
        'antoine-snyk-demo/TestRepoAntoine(private)',
      ],
    });
    resultsMap.set('snyk', {
      contributionsCount: 100,
      email: 'snyk@snyk.io',
      reposContributedTo: ['project/repo(public)'],
    });
    const resultsWithStats: ContributorMapWithSummary = {
      contributorsCount: 2,
      contributorsDetails: resultsMap,
      exclusionCount: 0,
      repoCount: 4,
      repoList: [
        'antoine-snyk-demo/testOrgana(private)',
        'antoine-snyk-demo/xyz(private)',
        'antoine-snyk-demo/TestRepoAntoine(private)',
        'project/repo(public)',
      ],
    };

    /* eslint-disable no-useless-escape */

    const output = [
      '#### Summary',
      '** This summary indicates the number of contributors who have made at least one commit in the last 90 days to repositories **',
      'Private Repos Contributors Count: 1',
      'Public Repos Contributors Count: 1',
      'Total Unique Contributors Count for Private and Public repositories: 2',
      'Private Repository Count: 3',
      'Public Repository Count: 1',
      'Total Repository Count: 4',
      'Exclusion Count: 0',
      '### Details:',
      '## Repository List',
      '# Private Repositories:',
      'antoine-snyk-demo/testOrgana(private) - Contributors count: 1',
      'antoine-snyk-demo/xyz(private) - Contributors count: 1',
      'antoine-snyk-demo/TestRepoAntoine(private) - Contributors count: 1',
      '# Public Repositories:',
      'project/repo(public) - Contributors count: 1',
      `## Contributors details,[`,
      `[`,
      `\"aarlaud\"`,
      `{`,
      `\"contributionsCount\": 10`,
      `\"email\": \"antoine@snyk.io\"`,
      `\"reposContributedTo\": [`,
      `\"antoine-snyk-demo/testOrgana(private)\",`,
      `\"antoine-snyk-demo/xyz(private)\",`,
      `\"antoine-snyk-demo/TestRepoAntoine(private)\"`,
      `]`,
      `}`,
      `],`,
      `[`,
      `\"snyk\",`,
      `{`,
      `\"contributionsCount\": 100,`,
      `\"email\": \"snyk@snyk.io\",`,
      `\"reposContributedTo\": [`,
      `\"project/repo(public)\"`,
      `]`,
      `}`,
      `]`,
      `]`,
    ];
    /* eslint-enable no-useless-escape */

    utils.printOutResults(resultsWithStats, false, '');
    output.forEach((line: string) => {
      expect(consoleOutput.join()).toContain(line);
    });
  });
});
