//import fs from 'fs';
import { homedir } from 'os';
import { join } from 'path';

import { promises as fs } from 'fs';

export async function parseJsonFile(file) {
  try {
    let data = await fs.readFile(file, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    throw new Error(error);
  }
}

export async function checkOutDirectory(outDirectory) {
  try {
    await fs.mkdir(outDirectory, { recursive: true });
    return;
  } catch (error) {
    throw new Error(error);
  }
}

export function getOutDirectory() {
  return join(homedir(), 'leylines', 'geodesy', 'results');
}

export async function writeOutFile(outDirectory, fileName, fileContent) {
  return fs.writeFile(outDirectory + '/' + fileName, fileContent);
}

//async function createDirectory(dir) {
//  let result = await mkdir(dir, {
//    recursive: true
//  })
//  console.log(result);
//}

