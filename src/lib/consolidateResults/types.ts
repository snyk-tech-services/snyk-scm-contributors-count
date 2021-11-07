export type ContributorMap = Map<
  ConsolidatedContributor['name'],
  ConsolidatedContributor['contributor']
>;

export interface ConsolidatedContributor {
  name: string;
  contributor: {
    email: string;
    alternateEmails?: string[];
    contributionsCount: number;
    reposContributedTo: string[];
  };
}
