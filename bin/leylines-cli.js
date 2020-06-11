#!/usr/bin/env node

import program from 'commander';
import { parseJsonFile } from '../lib/files.js';

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

