#!/usr/bin/env node

import { Command } from 'commander';
import { parseJsonFile } from '../lib/files.js';

const program = new Command();

parseJsonFile('package.json').then((pkg) => {
  program
    .version(pkg.version)
    .description(pkg.description)
    .command('circle', 'circle geometry')
    .command('platonic', 'platonic geometry')
    .command('greatcircle', 'greatcircle geometry')
    .parse(process.argv);
})
.catch((error) =>
  console.log(error)
);

