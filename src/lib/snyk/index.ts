import { Orgs, Org } from 'snyk-api-ts-client';
import { requestsManager } from 'snyk-request-manager';
import * as debugLib from 'debug';
import { Integration } from '../types';
const debug = debugLib('snyk:snyk');

export enum SourceType {
  'github',
  'github-enterprise',
  'bitbucket-cloud',
  'bitbucket-server',
  'azure-repos',
  'gitlab',
  'cli',
}

interface OrgsResponseType {
  orgs: OrgType[];
}
export interface OrgType {
  name: string;
  id: string;
  slug: string;
  url: string;
  group: {
    name: string;
    id: string;
  } | null;
}

interface Target {
  attributes: {
    displayName: string;
  };
}

export const retrieveMonitoredRepos = async (
  url: string,
  scmType: SourceType,
): Promise<string[]> => {
  let snykMonitoredRepos: string[] = [];

  try {

    //const orgs = (await new Orgs().get()) as OrgsResponseType;

    const snykRequestManager = new requestsManager();
    const orgs = await snykRequestManager.request({verb: "GET", url: `/orgs?version=2023-09-29~beta`, useRESTApi: true})
    snykMonitoredRepos = snykMonitoredRepos.concat(
      await retrieveMonitoredReposBySourceType(orgs.data.data, scmType),
    );

    snykMonitoredRepos = snykMonitoredRepos.concat(
      await retrieveMonitoredReposBySourceType(
        orgs.data.data,
        SourceType['cli'],
        url.replace(/https?:\/\//, '').split('/')[0],
      ),
    );
    return snykMonitoredRepos;
  } catch (err) {
    debug('Failed retrieving Snyk monitored repos\n' + err);
    console.log('Failed retrieving Snyk monitored repos');
  }
  return snykMonitoredRepos;
};

export const retrieveOrgsAndIntegrations = async (): Promise<Integration[]> => {
  const integrations: Integration[] = [];
  try {
    const orgs = (await new Orgs().get()) as OrgsResponseType;
    for (let i = 0; i < orgs.orgs.length; i++) {
      const integrationsInfo = await new Org({ orgId: orgs.orgs[i].id })
        .integrations()
        .get();
      integrations.push({
        org: { name: orgs.orgs[i].name, id: orgs.orgs[i].id },
        integrations: integrationsInfo,
      });
    }

    return integrations;
  } catch (err) {
    console.log(err);
  }
  return integrations;
};

export const retrieveMonitoredReposBySourceType = async (
  orgs: OrgType[],
  sourceType: SourceType,
  scmHostname?: string,
): Promise<string[]> => {
  let snykScmMonitoredRepos: string[] = [];
  try {
    const snykRequestManager = new requestsManager();

    for (let i = 0; i < orgs.length; i++) {
      const requestSync = await snykRequestManager.request({verb: "GET", url: `/orgs/${orgs[i].id}/targets?origin=${SourceType[sourceType]}&version=2023-09-29~beta`, useRESTApi: true})
      console.log(requestSync.data.data)
      const targetDisplayNames = requestSync.data.data.map((target: Target) => target.attributes.displayName)

      // const projectList = await new Org({ orgId: orgs[i].id }).projects.post({
      //   filters: { origin: SourceType[sourceType], isMonitored: true },
      // });

      snykScmMonitoredRepos = snykScmMonitoredRepos.concat(targetDisplayNames);
    }
    return snykScmMonitoredRepos;
  } catch (err) {
    console.log(err.data.errors)
    debug('Failed retrieving Snyk monitored SCM repos\n' + err);
    console.log('Failed retrieving Snyk monitored SCM repos');
  }
  return snykScmMonitoredRepos;
};