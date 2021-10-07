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
}

export interface Org {
  login: string;
}
