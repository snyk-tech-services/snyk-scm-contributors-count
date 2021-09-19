export interface Commits {
  author_name: string;
  author_email: string;
}

export interface Project {
  path_with_namespace?: string;
  id: string;
  visibility?: string;
}
