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
}

export interface Project {
  name: string;
  id: string;
}
