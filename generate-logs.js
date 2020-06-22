const cp = require("child_process");

const exec = command => cp.execSync(command).toString();
const core = require("@actions/core");

const changelog = exec("node ./bin/cli.js");

core.setOutput("changelog", JSON.stringify(changelog));
