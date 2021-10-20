import { Orgs, Org } from 'snyk-api-ts-client';
import * as debugLib from 'debug';
import { ProjectsPostResponseType } from 'snyk-api-ts-client/dist/client/generated/org';
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

export const retrieveMonitoredRepos = async (
  url: string,
  scmType: SourceType,
): Promise<string[]> => {
  let snykMonitoredRepos: string[] = [];

  try {
    const orgs = (await new Orgs().get()) as OrgsResponseType;
    snykMonitoredRepos = snykMonitoredRepos.concat(
      await retrieveMonitoredReposBySourceType(orgs.orgs, scmType),
    );

    snykMonitoredRepos = snykMonitoredRepos.concat(
      await retrieveMonitoredReposBySourceType(
        orgs.orgs,
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
    for (let i = 0; i < orgs.length; i++) {
      const projectList = await new Org({ orgId: orgs[i].id }).projects.post({
        filters: { origin: SourceType[sourceType], isMonitored: true },
      });
      // projects is always there even if empty

      const projectNameList =
        sourceType == SourceType.cli && scmHostname != ''
          ? extractRepoFromCLIProjectName(projectList, scmHostname!)
          : extractRepoFromSCMProjectName(projectList);

      snykScmMonitoredRepos = snykScmMonitoredRepos.concat(projectNameList);
    }
    return snykScmMonitoredRepos;
  } catch (err) {
    debug('Failed retrieving Snyk monitored SCM repos\n' + err);
    console.log('Failed retrieving Snyk monitored SCM repos');
  }
  return snykScmMonitoredRepos;
};

const extractRepoFromSCMProjectName = (
  projectList: ProjectsPostResponseType,
): string[] => {
  return projectList.projects
    ? projectList.projects
        ?.filter((x) => x)
        .map((project) => project.name?.split(':')[0] || '')
    : [];
};

const extractRepoFromCLIProjectName = (
  projectList: ProjectsPostResponseType,
  scmHostname: string,
): string[] => {
  const projectWithRemoteRepoUrlList =
    projectList.projects
      ?.filter((x) => x.remoteRepoUrl && x.remoteRepoUrl.includes(scmHostname))
      .map((project) => project.remoteRepoUrl || '') || [];
  return projectWithRemoteRepoUrlList;
};
