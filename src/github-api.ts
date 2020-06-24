import * as path from 'path';

import ConfigurationError from './configuration-error';
import { Fetcher } from './fetch';
import { GitHubIssueResponse, GithubPullRequest, GitHubUserResponse, Options } from './interfaces';

export default class GithubAPI {
  private cacheDir: string | undefined;

  private auth: string;

  private fetcher: Fetcher;

  constructor(config: Options) {
    this.cacheDir = config.cacheDir && path.join(config.rootPath, config.cacheDir, 'github');
    this.auth = GithubAPI.getAuthToken();
    if (!this.auth) {
      throw new ConfigurationError('Must provide GITHUB_AUTH');
    }
    this.fetcher = new Fetcher(this.auth, this.cacheDir);
  }

  public static getBaseIssueUrl(repo: string): string {
    return `https://github.com/${repo}/issues/`;
  }

  public async getIssueData(repo: string, issue: string): Promise<GitHubIssueResponse> {
    return this.fetcher.doRequest<GitHubIssueResponse>(
      `https://api.github.com/repos/${repo}/issues/${issue}`,
    );
  }

  public async getUserData(login: string): Promise<GitHubUserResponse> {
    return this.fetcher.doRequest<GitHubUserResponse>(`https://api.github.com/users/${login}`);
  }

  private async getMergedIssues(
    repo: string,
    fromDate: string,
    toDate: string,
  ): Promise<{ items: GithubPullRequest[] }> {
    return this.fetcher.doRequest<{ items: GithubPullRequest[] }>(
      `https://api.github.com/search/issues?q=repo:${repo}+is:pr+is:merged+merged:${fromDate}..${toDate}`,
    );
  }

  private async getPullRequestFiles(
    repo: string,
    prNumber: string,
  ): Promise<{ filename: string }[]> {
    return this.fetcher.doRequest<{ filename: string }[]>(
      `https://api.github.com/repos/${repo}/pulls/${prNumber}/files`,
    );
  }

  public async getPullRequests(
    repo: string,
    fromDate: string,
    toDate: string,
  ): Promise<GithubPullRequest[]> {
    const fromDateParts = fromDate.split(' ');
    const toDateParts = toDate.split(' ');
    const fromDateString = `${fromDateParts[0]}T${fromDateParts[1]}Z`;
    const toDateString = `${toDateParts[0]}T${toDateParts[1]}Z`;
    const { items } = await this.getMergedIssues(repo, fromDateString, toDateString);

    const pullRequests: GithubPullRequest[] = await Promise.all(
      items.map(async (item: GithubPullRequest) => {
        const pr = { ...item };
        const files = await this.getPullRequestFiles(repo, pr.number);
        pr.username = item.user.login;
        pr.files = files.map((file: { filename: string }) => file.filename);
        return pr;
      }),
    );

    return pullRequests;
  }

  private static getAuthToken(): string {
    return process.env.GITHUB_AUTH || '';
  }
}
