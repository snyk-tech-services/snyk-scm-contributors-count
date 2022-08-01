import * as debugLib from 'debug';
import Bottleneck from 'bottleneck';
import fetch from 'node-fetch';
const debug = debugLib('snyk:github-count');

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

export const fetchAllPages = async (
  url: string,
  token: string,
  itemName?: string,
): Promise<unknown[]> => {
  let isLastPage = false;
  let values: string[] = [];
  let pageCount = 1;
  while (!isLastPage) {
    debug(`Fetching page ${pageCount} for ${itemName}\n`);
    let response = await limiter.schedule(() =>
      fetch(url, {
        method: 'GET',
        headers: { Authorization: 'Bearer ' + token },
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
          fetch(url, {
            method: 'GET',
            headers: { Authorization: 'Bearer ' + token },
          }),
        );
      } else if (response.status == 409) {
        return [];
      } else {
        debug(
          `Failed to fetch page: ${url}\n, Response Status: ${response.status}\nResponse Status Text: ${response.statusText} `,
        );
      }
    }
    const apiResponse = (await response.json()) as string[];
    values = values.concat(apiResponse);
    const nextPage = response.headers.get('link');
    if (nextPage && nextPage?.includes('rel="next"')) {
      const nextPageLink = nextPage
        .split(',')
        .find((element) => element.includes('rel="next"'));
      if (nextPageLink) {
        url = nextPageLink.split(';')[0].replace('<', '').replace('>', '');
        if (!url.includes('https')) {
          url = url.replace('http', 'https');
        }
      }
    } else {
      isLastPage = true;
    }
    pageCount++;
  }
  return values;
};

const sleepNow = (delay: number): unknown =>
  new Promise((resolve) => setTimeout(resolve, delay));
