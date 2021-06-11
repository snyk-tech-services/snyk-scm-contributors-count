
import { dedupRepos, dedupContributorsByEmail, excludeFromListByEmail } from '.'
import { ContributorMap } from '../types'
import { retrieveMonitoredRepos, SourceType } from '../snyk'

export interface SCMHandlerInterface {
    fetchSCMContributors(snykMonitoredRepos?:string[]): Promise<ContributorMap>,
}

export class SCMHandlerClass {
    dedupRepos = dedupRepos
    dedupContributorsByEmail =dedupContributorsByEmail
    excludeFromListByEmail = excludeFromListByEmail
    retrieveMonitoredRepos = retrieveMonitoredRepos
    SourceType = SourceType
    
}