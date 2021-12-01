import type { Contributor as ContributorBase } from '../types';

export interface Commits {
  author: Author;
  date: number;
}

export type ContributorMap = Map<string, Contributor>;

export interface Contributor extends ContributorBase {
  name: string;
  alternateEmails: string[];
}

export interface Author {
  raw: string;
  name: string;
  emailAddress: string;
  displayName: string;
  user: User;
}

interface User {
  display_name: string;
  type: string;
  nickname: string;
  uuid: string;
}

export interface RepoListApiResponse {
  size: number;
  isLastPage: boolean;
  next?: string;
  values: Repo[];
}

export interface Repo {
  slug: string;
  workspace: {
    uuid: string;
    slug?: string;
  };
  mainbranch?: {
    name: string;
  };
  is_private?: boolean;
}

export interface Target {
  orgId?: string;
  integrationId?: string;
  target: {
    name: string;
    owner: string;
    branch?: string;
  };
}
