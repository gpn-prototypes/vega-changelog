import { Configuration } from './configuration';
import { Git } from './git';
import GithubAPI from './github-api';
import { GithubPullRequest, Issue } from './interfaces';
import MarkdownRenderer from './markdown-renderer';
import { Release } from './release';

interface Options {
  tagFrom?: string;
  tagTo?: string;
}

function onlyUnique(value: string, index: number, self: string[]): boolean {
  return self.indexOf(value) === index;
}

export default class Changelog {
  private readonly config: Configuration;

  private github: GithubAPI;

  private renderer: MarkdownRenderer;

  private git: Git;

  constructor(config: Configuration) {
    this.config = config;
    this.github = new GithubAPI(this.config);
    this.renderer = new MarkdownRenderer({
      baseIssueUrl: GithubAPI.getBaseIssueUrl(this.config.repo),
      repo: this.config.repo,
    });
    this.git = new Git(this.config.mainPackage);
  }

  private getFrom(options: Options): string {
    if (options.tagFrom) {
      return Git.getDateByTag(options.tagFrom);
    }

    return this.git.getPreviousMainPackageTagDate();
  }

  public async createMarkdown(options: Options = {}): Promise<string> {
    const { changelog } = this.config;
    const from = this.getFrom(options);

    const to = Git.getDateByTag(options.tagTo ?? 'HEAD');

    const release = new Release();
    release.setTag(options.tagTo ?? this.git.getLastMainPackageTag());
    if (changelog?.includes(release.getTag())) {
      return '';
    }
    release.setReleaseDate(to.split(' ')[0]);
    const issues = await this.github.getPullRequests(this.config.repo, from, to);

    const preparedIssues = this.prepareGithubIssues(issues);

    if (this.config.mode === 'monorepo') {
      release.setIssues(
        preparedIssues.filter((issue: Issue) => issue.packages && issue.packages.length > 0),
      );
    } else {
      release.setIssues(preparedIssues);
    }

    return this.renderer.renderMarkdown(release);
  }

  private prepareGithubIssues(issues: GithubPullRequest[]): Issue[] {
    const isMonorepo = this.config.mode === 'monorepo';
    const issuesByCategories = issues.map((issue: Issue) => {
      const pr = { ...issue };
      const packages = pr.files.map((file: string) => this.packageFromPath(file));
      if (isMonorepo) {
        pr.packages = packages
          .filter(onlyUnique)
          .filter((p: string) => p.length > 0 && !this.config.ignorePaths.includes(p));
      }
      return {
        title: pr.title,
        packages: pr.packages,
        username: pr.username,
        number: pr.number,
        files: pr.files,
      };
    });

    if (this.config.mode === 'monorepo') {
      return issuesByCategories.filter(
        (issue: Issue) => issue.packages && issue.packages.length > 0,
      );
    }

    return issuesByCategories;
  }

  private packageFromPath(path: string): string {
    const parts = path.split('/');
    if (parts[0] !== 'packages' || parts.length < 3) {
      return '';
    }

    if (parts.length >= 4 && this.config.ignorePaths.includes(parts[1])) {
      return `${parts[2]}`;
    }

    return parts[1];
  }
}
