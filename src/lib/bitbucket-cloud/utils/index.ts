import fetch from 'node-fetch';
import * as debugLib from 'debug';
import { repoListApiResponse, Commits } from '../types';
import Bottleneck from 'bottleneck';
import base64 = require('base-64');

const debug = debugLib('snyk:bitbucket-cloud-count');

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 300,
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

export const isAnyCommitMoreThan90Days = (values: unknown[]): boolean => {
  const date: Date = new Date();
  if (process.env.NODE_ENV == 'test') {
    date.setFullYear(2020, 6, 15);
  }

  const typedValues = values as Commits[];
  // return true to break pagination if any commit if more than 90 days old
  return typedValues.some(
    (typedValue) =>
      date.getTime() - 7776000000 > new Date(typedValue.date).getTime(),
  );
};

export const fetchAllPages = async (
  url: string,
  user: string,
  password: string,
  itemName?: string,
  breakIfTrue?: (values: unknown[]) => boolean,
): Promise<unknown[]> => {
  let isLastPage = false;
  let values: unknown[] = [];
  let pageCount = 1;
  while (!isLastPage) {
    debug(`Fetching page ${pageCount} for ${itemName}\n`);
    let response = await limiter.schedule(() =>
      fetch(`${url}`, {
        method: 'GET',
        headers: {
          Authorization: 'Basic ' + base64.encode(user + ':' + password),
        },
      }),
    );
    if (!response.ok) {
      if (response.status == 429) {
        debug(
          `Failed to fetch page: ${url}\n, Response Status: ${response.status}\nToo many requests \nWaiting for 3 minutes before resuming`,
        );
        await sleepNow(180000);
        debug(`Retrying to fetch page: ${url}`);
        debug(`Fetching page ${pageCount}\n`);
        response = await limiter.schedule(() =>
          fetch(`${url}`, {
            method: 'GET',
            headers: {
              Authorization: 'Basic ' + base64.encode(user + ':' + password),
            },
          }),
        );
      } else {
        debug(
          `Failed to fetch page: ${url}\n, Response Status: ${response.status}\nResponse Status Text: ${response.statusText} `,
        );
      }
    }
    const apiResponse = (await response.json()) as repoListApiResponse;
    values = values.concat(apiResponse.values);
    if (apiResponse.next) {
      url = apiResponse.next;
    } else {
      isLastPage = true;
    }
    pageCount++;
    if (typeof breakIfTrue == 'function' && breakIfTrue(values)) {
      break;
    }
  }
  return values;
};

const sleepNow = (delay: number): unknown =>
  new Promise((resolve) => setTimeout(resolve, delay));
