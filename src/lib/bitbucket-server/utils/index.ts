import fetch from 'node-fetch';
import * as debugLib from 'debug';
import { repoListApiResponse, Commits } from '../types';
import Bottleneck from 'bottleneck';

const debug = debugLib('snyk:bitbucket-server-count');

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 333,
});

limiter.on('failed', async (error, jobInfo) => {
  const id = jobInfo.options.id;
  console.warn(`Job ${id} failed: ${error}`);
  if (jobInfo.retryCount === 0) {
    // Here we only retry once
    console.log(`Retrying job ${id} in 25ms!`);
    return 25;
  }
});

export const isAnyCommitMoreThan90Days = (values: unknown[]) => {
  const date: Date = new Date();
  if (process.env.NODE_ENV == 'test') {
    date.setFullYear(2020, 6, 15);
  }

  const typedValues = values as Commits[];
  // return true to break pagination if any commit if more than 90 days old
  return typedValues.some(
    (typedValue) => date.getTime() - 7776000000 > typedValue.authorTimestamp,
  );
};

export const fetchAllPages = async (
  url: string,
  token: string,
  breakIfTrue?: (values: unknown[]) => boolean,
) => {
  let isLastPage = false;

  let values: unknown[] = [];
  let pageCount = 1;
  let start = 0;
  while (!isLastPage) {
    debug(`Fetching page ${pageCount}\n`);
    const response = await limiter.schedule(() =>
      fetch(`${url}?start=${start}`, {
        method: 'GET',
        headers: { Authorization: 'Bearer ' + token },
      }),
    );
    const apiResponse = (await response.json()) as repoListApiResponse;
    values = values.concat(apiResponse.values);
    isLastPage = apiResponse.isLastPage;
    start = apiResponse.nextPageStart || -1;
    pageCount++;
    if (breakIfTrue && breakIfTrue(values)) {
      break;
    }
  }
  return values;
};
