export interface Commits {
  commit: {
    author: author;
  };
}

export interface author {
  name: string;
  email: string;
}

export interface Repo {
  name: string;
  owner: {
    login: string;
  };
  private?: boolean;
  default_branch?: string;
}

export interface Org {
  login: string;
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
