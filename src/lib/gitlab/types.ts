export interface Commits {
  author_name: string;
  author_email: string;
}

export interface Group {
  id?: string;
  name?: string;
  full_path: string;
  visibility?: string;
}

export interface Project {
  path_with_namespace: string;
  id?: string;
  visibility?: string;
  default_branch?: string;
}

export interface User {
  id: string;
}

export interface Target {
  orgId?: string;
  integrationId?: string;
  target: {
    id: string;
    branch?: string;
  };
}
