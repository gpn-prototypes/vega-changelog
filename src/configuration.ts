const fs = require('fs');
const path = require('path');
const execa = require('execa');

export interface Configuration {
  repo: string;
  mode: 'repo' | 'monorepo';
  rootPath: string;
  mainPackage?: string;
  cacheDir?: string;
  ignorePaths: string[];
  changelog?: string;
}

const defaultChangelog = `# Changelog\n\n\n<!-- insert-new-changelog-here -->`;

function fromConfig(rootPath: string): Partial<Configuration> | undefined {
  const configPath = path.join(rootPath, 'changelog.config.js');
  if (fs.existsSync(configPath)) {
    return require(configPath);
  }

  return undefined;
}

export function getChangeLogFile(rootPath: string): string {
  const logPath = path.join(rootPath, 'CHANGELOG.md');
  if (fs.existsSync(logPath)) {
    return require(logPath);
  }

  const changelogFile = fs.writeFileSync('CHANGELOG.md', defaultChangelog, {
    encoding: 'utf8',
    flag: 'a+',
    mode: 0o666,
  });

  return changelogFile;
}

export function fromPath(rootPath: string): Configuration {
  const config = fromConfig(rootPath) || {};

  const { repo = '', cacheDir, mainPackage, mode = 'monorepo', ignorePaths = [] } = config;

  return {
    repo,
    mainPackage,
    ignorePaths,
    rootPath,
    mode,
    cacheDir,
  };
}

export function load(): Configuration {
  const cwd = process.cwd();
  const rootPath = execa.sync('git', ['rev-parse', '--show-toplevel'], { cwd }).stdout;

  const config = fromPath(rootPath);
  config.changelog = getChangeLogFile(rootPath);

  return config;
}
