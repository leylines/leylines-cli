import { circle } from '../lib/circle.js';
import { greatCircle } from '../lib/greatCircle.js';
import program from 'commander';

program
  .name('leylines-cli')
  .command('circle')
  .description('creates a circle on the sphere from 3 points')
  .option('-fp, --firstPoint <point>', 'first point')
  .option('-sp, --secondPoint <point>', 'second point')
  .option('-tp, --thirdPoint <point>', 'third point')
  .option('-ct, --calcType <type>', 'spherical or ellipsoidal')
  .option('-sc, --showCalc', 'show calculation')
  .option('-d, --outDirectory <dir>', 'directory to save results')
  .option('-f, --outFormat <kml|czml>', 'format to save results (kml, czml)')
  .action(function (args) {
    //console.log(args);
    circle(args)
  });

program
  .name('leylines-cli')
  .command('greatcircle')
  .description('create great-circles on the sphere from 2 points')
  .option('-sp, --sourcePoint <point>', 'source point')
  .option('-dp, --destinationPoint <point>', 'destination point')
  .option('-b, --bearing <bearing>', 'initial bearing')
  .option('-d, --outDirectory <dir>', 'directory to save results')
  .option('-f, --outFormat <kml|czml>', 'format to save results (kml, czml)')
  .action(function (args) {
    //console.log(args);
    greatCircle(args)
  });

program.parse(process.argv);
