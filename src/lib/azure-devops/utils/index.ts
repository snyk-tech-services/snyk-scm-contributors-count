import * as debugLib from 'debug';
import Bottleneck from 'bottleneck';
import base64 = require('base-64');
import fetch, { Response } from 'node-fetch';

// const base64 = require('base-64');
const debug = debugLib('snyk:azure-devops-count');

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 500,
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

export const getRepoCommits = async (
  url: string,
  project: string,
  repo: string,
  token: string,
  threeMonthsDate: string,
): Promise<Response> => {
  debug('Fetching commints for ' + repo);
  const data = await limiter.schedule(() =>
    fetch(
      url +
        '/' +
        project +
        '/_apis/git/repositories/' +
        repo +
        '/commits?$top=1000000&searchCriteria.fromDate=' +
        threeMonthsDate +
        '&api-version=4.1',
      {
        method: 'GET',
        headers: { Authorization: 'Basic ' + base64.encode(':' + token) },
      },
    ),
  );
  if (!data.ok) {
    debug(`Failed to fetch page: ${url}\n ${data.body}`);
  }
  return data;
};

export const getReposPerProjects = async (
  url: string,
  project: string,
  token: string,
): Promise<Response> => {
  debug('Fetching repos for ' + project);
  const data = await limiter.schedule(() =>
    fetch(
      url +
        '/' +
        project +
        '/_apis/git/repositories?$top=1000000&api-version=4.1',
      {
        method: 'GET',
        headers: { Authorization: 'Basic ' + base64.encode(':' + token) },
      },
    ),
  );
  if (!data.ok) {
    debug(`Failed to fetch page: ${url}\n ${data.body}`);
  }
  return data;
};

export const getProjects = async (
  url: string,
  OrgName: string,
  token: string,
): Promise<Response> => {
  debug('Fetching projects');
  const data = await limiter.schedule(() =>
    fetch(
      url + '/' + OrgName + '/_apis/projects?$top=1000000&api-version=4.1',
      {
        method: 'GET',
        headers: { Authorization: 'Basic ' + base64.encode(':' + token) },
      },
    ),
  );
  if (!data.ok) {
    debug(`Failed to fetch page: ${url}\n ${data.body}`);
  }
  return data;
};
