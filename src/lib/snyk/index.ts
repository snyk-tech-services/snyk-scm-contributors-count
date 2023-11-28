import { Orgs, Org } from 'snyk-api-ts-client';
import { requestsManager } from 'snyk-request-manager';
import * as debugLib from 'debug';
import { Integration } from '../types';
const debug = debugLib('snyk:snyk');

export const snykApiVersion = '2023-09-29~beta';
export enum SourceType {
  'github',
  'github-enterprise',
  'bitbucket-cloud',
  'bitbucket-server',
  'azure-repos',
  'gitlab',
  'cli',
}

export interface OrgType {
  id: string;
  type: string;
  attributes: {
    is_personal: boolean;
    name: string;
    slug: string;
    group: {
      name: string;
      id: string;
    } | null;
  };
}
export interface TargetType {
  type: string;
  id: string;
  attributes: {
    displayName: string;
    isPrivate: boolean;
    origin: string;
    remoteUrl: string | null;
  };
}

export const retrieveMonitoredRepos = async (
  url: string,
  scmType: SourceType,
): Promise<string[]> => {
  let snykMonitoredRepos: string[] = [];

  try {
    const snykRequestManager = new requestsManager();
    const orgsResponse = await snykRequestManager.request({
      verb: 'GET',
      url: `/orgs?version=${snykApiVersion}`,
      useRESTApi: true,
    });

    const orgs = orgsResponse.data.data as OrgType[];

    snykMonitoredRepos = snykMonitoredRepos.concat(
      await retrieveMonitoredReposBySourceType(orgs, scmType),
    );

    snykMonitoredRepos = snykMonitoredRepos.concat(
      await retrieveMonitoredReposBySourceType(
        orgs,
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
    const snykRequestManager = new requestsManager();
    const orgsResponse = await snykRequestManager.request({
      verb: 'GET',
      url: `/orgs?version=${snykApiVersion}`,
      useRESTApi: true,
    });

    const orgs = orgsResponse.data.data as OrgType[];

    for (let i = 0; i < orgs.length; i++) {
      const integrationsInfo = await new Org({ orgId: orgs[i].id })
        .integrations()
        .get();
      integrations.push({
        org: { name: orgs[i].attributes.name, id: orgs[i].id },
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
    let requestSync;
    let url = "";
    let hasData = false;

    for (let i = 0; i < orgs.length; i++) {

      url = `/orgs/${orgs[i].id}/targets?origin=${SourceType[sourceType]}&version=${snykApiVersion}`

      do {
        requestSync = await snykRequestManager.request({
          verb: 'GET',
          url: url,
          useRESTApi: true,
        });

        let targets = requestSync.data.data as TargetType[];

        if (SourceType[sourceType] === 'cli' && scmHostname) {
          targets = targets.filter(
            (target: TargetType) =>
              target.attributes.remoteUrl &&
              target.attributes.remoteUrl.includes(scmHostname),
          );
        }
        const targetDisplayNames = targets.map(
          (target) => target.attributes.displayName,
        );

        snykScmMonitoredRepos = snykScmMonitoredRepos.concat(targetDisplayNames);

        if (requestSync.data.links.next) {
          url = requestSync.data.links.next;
          hasData = true;
          debug(`Load more data for Org: ${orgs[i].attributes.name}`);

        } else {
          hasData = false;
        }
      } while(hasData);
    }
    return snykScmMonitoredRepos;
  } catch (err: any) {
    debug('Failed retrieving Snyk monitored SCM repos\n' + err);
    console.log('Failed retrieving Snyk monitored SCM repos');
  }
  return snykScmMonitoredRepos;
};
