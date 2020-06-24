/* eslint-disable no-console */

import { highlight } from 'cli-highlight';

import Changelog from './changelog';
import { load as loadConfig } from './configuration';
import ConfigurationError from './configuration-error';

const chalk = require('chalk');
const yargs = require('yargs');

export async function run(): Promise<void> {
  const argv = yargs
    .usage('lerna-changelog [options]')
    .options({
      from: {
        type: 'string',
        desc: 'A git tag or commit hash that determines the lower bound of the range of commits',
        defaultDescription: 'latest tagged commit',
      },
      to: {
        type: 'string',
        desc: 'A git tag or commit hash that determines the upper bound of the range of commits',
      },
    })
    .example(
      'lerna-changelog',
      'create a changelog for the changes after the latest available tag, under "Unreleased" section',
    )
    .example(
      'lerna-changelog --from=0.1.0 --to=0.3.0',
      'create a changelog for the changes in all tags within the given range',
    )
    .epilog('For more information, see https://github.com/lerna/lerna-changelog')
    .wrap(Math.min(100, yargs.terminalWidth()))
    .parse();

  const options = {
    tagFrom: argv.from,
    tagTo: argv.to,
  };

  try {
    const config = loadConfig();
    const result = await new Changelog(config).createMarkdown(options);

    const highlighted = highlight(result, {
      language: 'Markdown',
      theme: {
        section: chalk.bold,
        string: chalk.hex('#0366d6'),
        link: chalk.dim,
      },
    });

    console.log(highlighted);
  } catch (e) {
    if (e instanceof ConfigurationError) {
      console.log(chalk.red(e.message));
    } else {
      console.log(chalk.red(e.stack));
    }

    process.exitCode = 1;
  }
}
