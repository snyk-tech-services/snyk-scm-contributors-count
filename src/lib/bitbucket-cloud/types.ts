export interface CommitsApiResponse {
  values: Commits[];
}
export interface Commits {
  author: author;
  date: number;
}

export interface author {
  raw: string;
  name: string;
  emailAddress: string;
  displayName: string;
  user: user;
}

interface user {
display_name: string;
type: string;
nickname: string;
}

export interface repoListApiResponse {
  size: number;
  isLastPage: boolean;
  next?: string;
  values: unknown[];
}

export interface Repo {
  slug: string;
  workspace: {
    uuid: string;
    slug?: string;
  };
  is_private?: boolean;
}
