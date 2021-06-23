import { Orgs, Org } from 'snyk-api-ts-client';
import * as debugLib from 'debug';
import { ProjectsPostResponseType } from 'snyk-api-ts-client/dist/client/generated/org';

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
  } catch (err) {
    debug('Failed retrieving Snyk monitored repos\n' + err);
    console.log('Failed retrieving Snyk monitored repos');
  } finally {
    return snykMonitoredRepos;
  }
};

export const retrieveMonitoredReposBySourceType = async (
  orgs: OrgType[],
  sourceType: SourceType,
  scmHostname?: string,
) => {
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
  } catch (err) {
    debug('Failed retrieving Snyk monitored SCM repos\n' + err);
    console.log('Failed retrieving Snyk monitored SCM repos');
  } finally {
    return snykScmMonitoredRepos;
  }
};

const extractRepoFromSCMProjectName = (
  projectList: ProjectsPostResponseType,
) => {
  return projectList.projects
    ? projectList.projects
        ?.filter((x) => x)
        .map((project) => project.name?.split(':')[0] || '')
    : [];
};

const extractRepoFromCLIProjectName = (
  projectList: ProjectsPostResponseType,
  scmHostname: string,
) => {
  const projectWithRemoteRepoUrlList =
    projectList.projects
      ?.filter((x) => x.remoteRepoUrl && x.remoteRepoUrl.includes(scmHostname))
      .map((project) => project.remoteRepoUrl || '') || [];
  return projectWithRemoteRepoUrlList;
};
