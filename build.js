const cp = require('child_process');
const fs = require('fs');

const exec = (command) => cp.execSync(command).toString();

fs.rmdirSync('lib', { recursive: true });
exec('tsc');
