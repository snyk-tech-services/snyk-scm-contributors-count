export interface Commits {
  author: author;
}

export interface author {
  name: string;
  email: string;
}

export interface Repo {
  name: string;
  project: {
    key: string;
    id?: string;
    name?: string;
    visibility?: string;
  };
  defaultBranch?: string;
}

export interface Project {
  name: string;
  id: string;
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
