import * as fs from 'fs';
import * as p from 'path';

// 异步判断路径是否存在
export const isPathExist = (path: string): boolean => {
  return fs.existsSync(path);
};

// 用于拼接路径
export const getPathConcat = (...paths: string[]): string => {
  return p.join(...paths);
};

// 根据文件路径获取文件名称
export const getFileNameByFilePath = (filePath: string): string => {
  return p.basename(filePath);
};

// 获取上一路径
export const getDirPathByPath = (path: string): string => {
  return p.dirname(path);
};

// 根据文件夹路径获取文件夹名称
export const getDirNameByDirPath = (dirPath: string): string => {
  return p.basename(dirPath);
};

// 递归获取文件夹下的所有文件夹路径
export const getAllDirPathByDirPathRecursion = (dirPath): Array<string> => {
  const dirPathArr = [];
  const recursion = (dirPath, dirPathArr) => {
    dirPathArr.push(dirPath);
    const dirs = fs.readdirSync(dirPath).filter((item) => {
      const statObj = fs.statSync(p.join(dirPath, item));
      return statObj.isDirectory();
    });
    dirs.forEach((dir) => {
      recursion(p.join(dirPath, dir), dirPathArr);
    });
  };
  recursion(dirPath, dirPathArr);
  return dirPathArr;
};

// 获取文件夹下的所有文件路径（一级）
export const getAllFilePathByDirPath = (dirPath): Array<string> => {
  const filesPathArr = [];
  const files = fs.readdirSync(dirPath).filter((item) => {
    // 过滤文件夹
    const statObj = fs.statSync(p.join(dirPath, item));
    return !statObj.isDirectory();
  });
  files.forEach((file) => {
    filesPathArr.push(p.join(dirPath, file));
  });
  return filesPathArr;
};

// 递归获取文件夹下的所有文件路径
export const getAllFilePathByDirPathRecursion = (dirPath): Array<string> => {
  const filesPathArr = [];
  getAllDirPathByDirPathRecursion(dirPath).forEach((dir) => {
    filesPathArr.push(...getAllFilePathByDirPath(dir));
  });
  return filesPathArr;
};

// 同步确认文件夹存在，不存在则递归创建
export const confirmDirPathExistSync = (dirPath: string): string => {
  if (!isPathExist(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
};

// 同步确认文件所在的文件夹是否存在，不存在则递归创建
export const confirmDirPathExistByFilePathSync = (filePath: string): string => {
  const dirPath = getDirPathByPath(filePath);
  if (!isPathExist(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return filePath;
};
