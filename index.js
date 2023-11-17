import { program } from 'commander';
import fs from 'fs-extra';
import chalk from 'chalk';
import gitcrop from './gitcrop.js';

program
    .option('-h, --help')
    .option('-q, --quiet')
    .option('-d, --dry-run');

program.parse();
const options = program.opts();

if(options.help) {
    console.log(`gitcrop, an alternative to git clean`);
    console.log();
    console.log(`-d  --dry-run  indicate files only, do not delete`);
    console.log(`-q  --quiet    delete without prompting - very dangerous, but good for scripts`);
    console.log();
    console.log(`-h  --help     what you are reading now`);
    process.exit(0);
}

if(!fs.exists('.gitignore')) {
    console.error(chalk.redBright(`No .gitignore found.`));
    process.exit(-1);
}

gitcrop(options.dryRun, options.quiet);
