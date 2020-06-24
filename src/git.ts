const execa = require('execa');
const { execSync } = require('child_process');

export class Git {
  private mainPackageTags: string[];

  constructor(mainPackage?: string) {
    this.mainPackageTags = Git.getPackageTags(mainPackage);
  }

  public getLastMainPackageTag(): string {
    return this.mainPackageTags[this.mainPackageTags.length - 1];
  }

  public getPreviousMainPackageTagDate(): string {
    return Git.getDateByTag(this.mainPackageTags[this.mainPackageTags.length - 2]);
  }

  private static getPackageTags(mainPackage?: string): string[] {
    const getPackageCommand = `git for-each-ref --sort=creatordate --format '%(tag)'`;

    const exec = (command: string): string[] =>
      execSync(command)
        .toString()
        .split('\n')
        .filter((result: string) => result.length > 0);

    if (mainPackage) {
      return exec(`${getPackageCommand} | grep ${mainPackage}`);
    }

    return exec(getPackageCommand);
  }

  public static getDateByTag(tag: string): string {
    return execa.sync('git', ['log', '-1', '--format=%ai', tag]).stdout;
  }

  public static async changedPaths(sha: string): Promise<string[]> {
    try {
      const result = await execa('git', [
        'show',
        '-m',
        '--name-only',
        '--pretty=format:',
        '--first-parent',
        sha,
      ]);
      return result.stdout.split('\n');
    } catch {
      return [];
    }
  }
}
