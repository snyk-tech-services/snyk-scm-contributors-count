
import { dedupRepos, dedupContributorsByEmail, excludeFromListByEmail, calculateSummaryStats, printOutResults } from '.'
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
    calculateSummaryStats = calculateSummaryStats
    printOutResults = printOutResults
    SourceType = SourceType
    
}