import fs from 'fs';
import inquirer from 'inquirer';
import chalk from 'chalk';
import Listr from 'listr';
import { getCircle } from 'leylines-geodesy';
import { parseJsonFile } from './files.js';
import { checkOutDirectory, getOutDirectory, writeOutFile } from './files.js';

async function promptForMissingOptions(options) {

 const defaultCalcType = 'spherical';
 const questions = [];

 if (!options.firstPoint) {
   questions.push({
     type: 'input',
     name: 'firstPoint',
     message: 'First point?',
     default: 'giza',
   });
 }

 if (!options.secondPoint) {
   questions.push({
     type: 'input',
     name: 'secondPoint',
     message: 'Second point?',
     default: 'kailash',
   });
 }

 if (!options.thirdPoint) {
   questions.push({
     type: 'input',
     name: 'thirdPoint',
     message: 'Third point?',
     default: 'stonehenge',
   });
 }

 if (!options.calcType) {
   questions.push({
     type: 'list',
     name: 'calcType',
     message: 'Please choose which calulation to use',
     choices: ['ellipsoidal', 'spherical'],
     default: defaultCalcType,
   });
 }

 if (!options.showCalc) {
   questions.push({
     type: 'confirm',
     name: 'showCalc',
     message: 'Please choose wether to show or not calculations',
     default: false,
   });
 }

 const answers = await inquirer.prompt(questions);
 return {
   ...options,
   firstPoint: options.firstPoint || answers.firstPoint,
   secondPoint: options.secondPoint || answers.secondPoint,
   thirdPoint: options.thirdPoint || answers.thirdPoint,
   calcType: options.calcType || answers.calcType,
   showCalc: options.showCalc || answers.showCalc,
   outDirectory: options.outDirectory || getOutDirectory(),
 };
}

export async function createCircle(options) {

  const tasks = new Listr([
   {
     title: 'checking directory',
     task: () => {
       return new Listr([
         {
           title: 'Check directory for results',
           task: (ctx) => {
             checkOutDirectory(ctx.options.outDirectory)
             .catch(error => {
               //throw new Error(error);
               //console.log("%s Error checking directory", chalk.red.bold('ERROR'));
               //task.abort;
               return;
             });
           }
         },
       ], {
         exitOnError: true,
         concurrent: false, 
       });
     }
   },
//   {
//    title: 'Failure',
//    task: () => Promise.reject(new Error('Something went wrong'))
//   },
   {
     title: 'get point coordinates',
     task: (ctx) => {
       ctx.points = parsePointsFile('data/points.json');
     },
   },
   {
     title: 'calculate result',
     task: (ctx) => {
       ctx.content = getCircle(ctx.options.firstPoint, ctx.options.secondPoint, ctx.options.thirdPoint, ctx.points[ctx.options.firstPoint], ctx.points[ctx.options.secondPoint], ctx.points[ctx.options.thirdPoint], ctx.options.showCalc);
     },
   },
   {
     title: 'write file',
     task: (ctx) => {
       writeOutFile(ctx.options.outDirectory, 'test.czml', JSON.stringify(ctx.content));
     },
   },
  ], {
    exitOnError: true
  });

  try {
    await tasks.run({
      points: [],
      content: [],
      options: options,
    })
  } catch (error) {
    console.error(error);;
  };
  console.log('%s Calculation ', chalk.green.bold('DONE'));

}

export async function circle(options) {
  options = await promptForMissingOptions(options);
  await createCircle(options);
}

