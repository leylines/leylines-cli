#!/usr/bin/env node

// import modules
import yargs from 'yargs';
import { points, grid, fibonacci } from 'leylines-geodesy';
import { geogrid } from 'leylines-geodesy';
import { greatcircles, circle } from 'leylines-geodesy';
import { calculatePlatonic } from 'leylines-geodesy';
import { createCzmlHeader } from 'leylines-geodesy';
import fs from 'fs';

import Table from 'table';
const table = Table.table;

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const allpoints = require('./points.json');

// parse command line arguments
const argv = yargs
  .command('points', 'calculations with all points')
  .command('fiboncci', 'calculations of grid with fibonacci')
  .command('grid', 'calculation of a grid', {
    grid: {
      alias: 'g',
      description: 'grid in degrees',
      demand: true
    }
  })
  .command('geogrid', 'calculation of a grid', {
    grid: {
      alias: 'g',
      description: 'grid in degrees',
      demand: true
    }
  })
  .command('beckerhagens', 'calculate beckerhagens')
  .command('cube', 'calculate cube')
  .command('dodecahedron', 'calculate dodecahedron')
  .command('icosahedron', 'calculate icosahedron')
  .command('octahedron', 'calculate octahedron')
  .command('tetrahedron', 'calculate tetrahedron')
  .command('greatcircles', 'calculate big circles')
  .command('circle', 'calculate circle of 3 points', {
    midpoint: {
      alias: 'mp',
      description: 'midpoint',
      demand: true
    },
    mode: {
      description: 'mode',
      demand: true,
      default: "ellipsoidal"
    },
    showcalc: {
      alias: 'sc',
      description: 'show calculation',
      demand: false
    }
  })
  .options({
    startpoint: {
      description: 'startpoint of calculation',
      alias: 'sp',
      demandOption: true
    },
    destinationpoint: {
      description: 'destinationpoint of calculation',
      alias: 'dp',
    },
    bearing: {
      description: 'bearing',
      alias: 'b',
    },
    distanceconditions: {
      description: 'show grids depending on distance to camera',
      alias: 'dc',
      type: 'boolean',
      default: false,
    }
  })
  .usage('Usage: $0 <command> [options]')
  .help('h')
  .alias('help', 'h')
  .demand(1, "You must provide a valid command")
  .argv;

var command = process.argv[2]
var args    = process.argv.slice(3);

var sp      = argv.startpoint;
var dp      = argv.destinationpoint;
var mp      = argv.midpoint;
var calc    = argv.showcalc;
var mode    = argv.mode;
var b       = argv.bearing;
var g       = argv.grid;
var dc      = argv.distanceconditions;

if (!dp && !b) {
  console.log("Either destinaionpoint or rhumblebearing must be defined");
  process.exit(1)
} else if (dp && b && command != "geogrid") {
  console.log("destinaionpoint and bearing are defined");
  console.log("taking destinaionpoint for calculations");
}

// set variables
var path = process.cwd();
var czml = [];
var filename;

czml.push(createCzmlHeader());

if (['geogrid'].includes(command)) {
  filename = "geodesic-" + command + "-" + sp + "-" + dp;
  if (b) {
    filename += "-" + b;
  }
  switch(command) {
    case 'geogrid':
      filename += "-" + g
      var result = geogrid(allpoints, sp, dp, b, g, dc);
      czml = czml.concat(result);
      break;
  }
  filename += ".czml";
} else if (['points', 'grid', 'fibonacci'].includes(command)) {
  filename = "loxodrome-" + command + "-" + sp;
  if (!b) {
    filename += "-" + dp 
  } else {
    filename += "-" + b;
  }
  switch(command) {
    case 'point':
      var result = points(allpoints, sp, dp, b);
      czml = czml.concat(result);
      break;
    case 'grid':
      filename += "-" + g
      var result = grid(allpoints, sp, dp, b, g, dc);
      czml = czml.concat(result);
      break;
    case 'fibonacci':
      var result = fibonacci(allpoints, sp, dp, b, g, dc);
      czml = czml.concat(result);
      break;
  }
  filename += ".czml";
} else if (['greatcircles', 'circle'].includes(command)) {
  filename = command + "-" + sp;
  if (!b) {
    filename += "-" + dp 
  } else {
    filename += "-" + b;
  }
  switch(command) {
    case 'greatcircles':
      var result = greatcircles(allpoints, sp, dp);
      czml = czml.concat(result);
      break;
    case 'circle':
      filename += "-" + mp;
      if (mode == "ellipsoidal") {
        filename += "-ellipsoidal";
      } else {
        filename += "-spherical";
      }
      var result = circle(allpoints, sp, dp, mp, mode, calc);
      czml = czml.concat(result);
      break;
  }
  filename += ".czml";
} else if (['cube', 'dodecahedron', 'beckerhagens', 'icosahedron', 'tetrahedron', 'octahedron'].includes(command)) {
  filename = "platonic-" + command + "-" + sp;
  if (!b) {
    filename += "-" + dp 
  } else {
    filename += "-" + b;
  }
  var result = calculatePlatonic(allpoints, sp, dp, command);
  czml = czml.concat(result);
  filename += ".czml";
} else {
  yargs.showHelp();
  process.exit(1)
}
/*
var tabledata = [
  [ "Command", command ],
  [ "Startpoint", sp + " (" + allpoints[sp]['coords'] + ")" ],
  [ "Endpoint", dp + " (" + allpoints[dp]['coords'] + ")" ],
  [ "Bearing", b ],
  [ "Grid", g ],
  [ "Show Distance Conditions", dc ],
  [ "Filename", filename ]
];

var output = table(tabledata);
console.log(output);
*/

fs.writeFile(path + "/results/" + filename, JSON.stringify(czml), function(err){
  if (err) throw err;
}); 

