import inquirer from 'inquirer';
import chalk from 'chalk';
import Listr from 'listr';
import { getGreatCircle, getGeodesicGrid, getInitialValues } from 'leylines-geodesy';
import { parseJsonFile, checkOutDirectory, getOutDirectory, writeOutFile } from './files.js';

async function promptForMissingOptions(options) {

  const questions = [];
  const defaultFormat = 'kml';

  if (!options.sourcePoint) {
    questions.push({
      type: 'input',
      name: 'sourcePoint',
      message: 'source point?',
      default: 'giza',
    });
  }

  if (!options.destinationPoint && !options.bearing) {
    questions.push({
      type: 'input',
      name: 'destinationPoint',
      message: 'destination point?',
      default: 'kailash',
    });
  }

  if (!options.destinationPoint && !options.bearing) {
    questions.push({
      type: 'input',
      name: 'bearing',
      message: 'bearing?',
      default: '0',
    });
  }

  if (!options.outFormat) {
    questions.push({
      type: 'list',
      name: 'outFormat',
      message: 'Please choose a format',
      choices: ['kml', 'czml'],
      default: defaultFormat,
    });
  }

  const answers = await inquirer.prompt(questions);
  return {
    ...options,
    sourcePoint: options.sourcePoint || answers.sourcePoint,
    destinationPoint: options.destinationPoint || answers.destinationPoint,
    bearing: options.bearing || answers.bearing,
    outFormat: options.outFormat || answers.outFormat,
    outDirectory: options.outDirectory || getOutDirectory(),
  };
}

export async function createResult(options) {

  const tasks = new Listr([
    {
      title: 'Checking directory',
      task: async (ctx) => {
        await checkOutDirectory(ctx.options.outDirectory)
          .catch((error) => {
            throw new Error(error);
          });
      },
    },
    {
      title: 'Get point coordinates',
      task: async (ctx) => {
        await parseJsonFile('data/points.json')
          .then( async (points) => {
            var values = await getInitialValues(points, ctx.options.sourcePoint, ctx.options.destinationPoint, ctx.options.bearing);
            ctx.values = values;
          })
          .catch((error) => {
            throw new Error(error);
          });
      },
    },
    {
      title: 'Calculate result',
      task: async (ctx) => {
        //ctx.content = await getGreatCircle(ctx.options.sourcePoint, ctx.options.destinationPoint, ctx.points[ctx.options.sourcePoint], ctx.points[ctx.options.destinationPoint], ctx.options.bearing, ctx.options.outFormat);
        ctx.content = await getGreatCircle(ctx.values, ctx.options.outFormat);
        ctx.content = await getGeodesicGrid(ctx.values, 5, ctx.options.outFormat);
        //ctx.content = await getGeodesicGrid(ctx.points, 5, ctx.options.outFormat);
      },
    },
    {
      title: 'Write file',
      task: (ctx) => {
        writeOutFile(ctx.options.outDirectory, ctx.values.filename + '.' + ctx.options.outFormat, ctx.content);
        console.log('Write file ' + ctx.values.filename + ' to ' + ctx.options.outDirectory);
      },
    },
  ], {
    exitOnError: true
  });

  try {
    await tasks.run({
      values: [],
      content: [],
      options: options,
    });
  } catch (error) {
    //console.error(error);
  }
  console.log('%s Calculation ', chalk.green.bold('DONE'));

}

export async function greatCircle(options) {
  options = await promptForMissingOptions(options);
  await createResult(options);
}

