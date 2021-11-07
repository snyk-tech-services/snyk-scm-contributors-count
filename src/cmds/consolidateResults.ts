import * as debugLib from 'debug';
import { consolidateResults } from '../lib/consolidateResults/consolidate';
import { access } from 'fs/promises';
import { constants } from 'fs';
import { calculateSummaryStats } from '../lib/common/utils';
import { printOutResults } from '../lib/common/output';

const debug = debugLib('snyk:consolidate');

export const command = ['consolidateResults'];
export const desc = 'Consolidate results into a unique contributors list.\n';

export const builder = {
  folderPath: {
    required: true,
    default: './',
    desc: 'Path to a folder containing the json outputs',
  },
};

export async function handler(argv: { folderPath: string }): Promise<void> {
  if (process.env.DEBUG) {
    debug('DEBUG MODE ENABLED \n');
    debug('ℹ️  Options: ' + JSON.stringify(`Folder Path: ${argv.folderPath}`));
  }
  try {
    if (!argv.folderPath.endsWith('/')) {
      argv.folderPath += '/';
    }
    await access(argv.folderPath, constants.R_OK | constants.W_OK);
  } catch {
    console.error(
      `Cannot access ${argv.folderPath} for reading/writing, please restart and provide a valid path`,
    );
    process.exit(1);
  }
  const consolidatedResult = await consolidateResults(argv.folderPath);
  const outputResults = calculateSummaryStats(consolidatedResult, 0);
  printOutResults(outputResults, true, argv.folderPath);
}
