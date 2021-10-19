export interface CommitsApiResponse {
  values: Commits[];
}
export interface Commits {
  author: author;
  authorTimestamp: number;
}

export interface author {
  name: string;
  emailAddress: string;
  displayName: string;
}

export interface repoListApiResponse {
  size: number;
  limit: number;
  isLastPage: boolean;
  start: number;
  nextPageStart?: number;
  values: unknown[];
}

export interface Repo {
  name: string;
  project: {
    key: string;
    name?: string;
  };
  public?: boolean;
}

export interface Target {
  orgId?: string;
  integrationId?: string;
  target: {
    projectKey: string;
    repoSlug: string;
  };
}
