export interface Issue {
  title: string;
  packages?: string[] | undefined;
  username: string;
  number: string;
  files: string[];
}

export interface GithubPullRequest {
  title: string;
  commits: GitHubIssueResponse[];
  number: string;
  files: string[];
  user: { login: string };
  username: string;
}

export interface GitHubUserResponse {
  login: string;
  name: string;
  html_url: string;
}
export interface GitHubIssueResponse {
  number: number;
  title: string;
  files: { name: string }[];
  sha: string;
  pull_request?: {
    html_url: string;
  };
  labels: Array<{
    name: string;
  }>;
  user: {
    login: string;
    html_url: string;
  };
}

export interface Options {
  repo: string;
  rootPath: string;
  cacheDir?: string;
}
