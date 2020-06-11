import fs from 'fs';

export function parsePointsFile(file) {
  let data = fs.readFileSync(file, 'utf8');
  return JSON.parse(data);
}
