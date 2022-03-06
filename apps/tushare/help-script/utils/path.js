const p = require('path');
const fs = require('fs');

exports.getPathAbsolute = (pathR) => {
  const workDir = process.cwd();
  if (pathR === '.') {
    return workDir;
  } else {
    return p.join(workDir, pathR);
  }
};

exports.getPathConcat = (path1, path2) => {
  return p.join(path1, path2);
};

exports.getSliceBasePath = (path, basepath) => {
  return path.split(basepath + '\\')[1];
};

exports.getPathType = (path) => {
  return fs.statSync(path).isDirectory() ? 'dir' : 'file';
};

exports.getUpperDirPath = (path) => {
  return p.dirname(path);
};

const getFileNameFromPath = (filePath) => {
  return p.basename(filePath);
};

exports.getFileNameFromPath = getFileNameFromPath;

exports.getDirNameFromPath = (dirPath) => {
  return p.basename(dirPath);
};

const getFileSuffix = (fileName) => {
  return fileName.match(/(\..+)$/)[1];
};

exports.getFileSuffix = getFileSuffix;

exports.getFileNameNoSuffix = (filePath) => {
  const fileName = p.basename(filePath);
  return fileName.match(/([^\.]+)/)[1];
};

exports.getDirPathFiltered = (dirPathArr, excluded) => {
  let filterResult = dirPathArr.filter((dirPath) => {
    if (excluded.includes(dirPath)) {
      return false;
    }
    return true;
  });
  return filterResult;
};

exports.getFilePathFiltered = (
  filePathArr,
  excluded,
  suffixRegArr,
  notSuffixRegArr,
) => {
  let filterResult = filePathArr.filter((filePath) => {
    const fileName = getFileNameFromPath(filePath);
    if (excluded && excluded.includes(fileName)) {
      return false;
    }
    const suffix = getFileSuffix(fileName);
    let regMapResult = false;
    if (suffixRegArr) {
      for (let i = 0; i < suffixRegArr.length; i++) {
        if (suffixRegArr[i].test(suffix)) {
          regMapResult = true;
          break;
        }
      }
      if (notSuffixRegArr) {
        for (let i = 0; i < notSuffixRegArr.length; i++) {
          if (notSuffixRegArr[i].test(suffix)) {
            regMapResult = false;
            break;
          }
        }
      }
    }
    return regMapResult;
  });
  return filterResult;
};
