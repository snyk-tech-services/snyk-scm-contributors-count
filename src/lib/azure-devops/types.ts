// export interface CommitsApiResponse {
//   values: Commits[];
// }
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
  };
  public?: boolean;
}

export interface Project {
  name: string;
  id: string;
}
