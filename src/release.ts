import { Issue } from './interfaces';

export class Release {
  private tag = 'UNRELEASED';

  private issues: Issue[] = [];

  private releaseDate: string = Date.now().toString();

  public setIssues(issues: Issue[]): void {
    this.issues = issues;
  }

  public setTag(tag: string): void {
    this.tag = tag;
  }

  public setReleaseDate(releaseDate: string): void {
    this.releaseDate = releaseDate;
  }

  public getIssues(): Issue[] {
    return this.issues;
  }

  public getTag(): string {
    return this.tag;
  }

  public getReleaseDate(): string {
    return this.releaseDate;
  }
}
