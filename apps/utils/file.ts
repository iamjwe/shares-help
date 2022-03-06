import * as fs from 'fs';
import {} from './path';

export const readTextAsync = (
  filePath,
  callback?: (err, data: string) => void,
): void => {
  fs.readFile(filePath, { encoding: 'utf-8' }, callback);
};

export const readFileAsync = (
  filePath: string,
  callback: (err, data: Buffer) => void,
): void => {
  fs.readFile(filePath, callback);
};

export const writeFileSync = (filePath, content): void => {
  fs.writeFileSync(filePath, content);
};

export const writeFileAsync = (
  filePath: string,
  content: Buffer | string,
  callback?: (err) => void,
): void => {
  fs.writeFile(filePath, content, callback);
};

// 同步读
export const readFileSync = (filePath): Buffer => {
  return fs.readFileSync(filePath);
};
