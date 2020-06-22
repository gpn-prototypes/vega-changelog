const cp = require("child_process");

const exec = command => cp.execSync(command).toString();

const changelog = exec("node ./bin/cli.js");

const jsonLog = JSON.stringify(changelog);

exec(`echo "::set-output name=changelog::${jsonLog}"`);
