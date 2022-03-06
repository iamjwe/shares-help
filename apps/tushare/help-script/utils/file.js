const fs = require('fs');
const p = require('path');

const isPathExist = (path) => {
  return fs.existsSync(path);
};

exports.isPathExist = isPathExist;

exports.getAllDirNameRecursion = (dirPath) => {
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

exports.readFileBuffer = (filePath) => {
  return fs.readFileSync(filePath);
};

const readFileUtf8 = (filePath) => {
  return fs.readFileSync(filePath, { encoding: 'utf-8' });
};

exports.readFileUtf8 = readFileUtf8;

exports.readJsonFile = (filePath) => {
  return JSON.parse(fs.readFileSync(filePath));
};

exports.writeFile = (filePath, content) => {
  return fs.writeFileSync(filePath, content);
};

const deleteDir = (dirPath) => {
  let files = [];
  if (isPathExist(dirPath)) {
    files = fs.readdirSync(dirPath);
    files.forEach(function (file) {
      let curPath = p.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteDir(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
};

exports.deleteDir = deleteDir;

const createDir = (dirPath) => {
  if (!isPathExist(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true }); // 多级创建
  }
  return dirPath;
};
exports.createDir = createDir;

exports.createFile = (filePath) => {
  const dirPath = p.dirname(filePath);
  createDir(dirPath);
  if (!isPathExist(filePath)) {
    fs.openSync(filePath, 'w');
  }
  return filePath;
};

exports.getFilesPathArrByDir = (dirPath, fileNameReg) => {
  let filesPathArr = [];
  let files = fs.readdirSync(dirPath).filter((item) => {
    // 过滤文件夹
    const statObj = fs.statSync(p.join(dirPath, item));
    return !statObj.isDirectory();
  });
  if (fileNameReg) {
    files = files.filter((fileName) => {
      const fileSuffix = fileName.match(/(\..+)$/)[1];
      return fileNameReg.test(fileSuffix);
    });
  }
  files.forEach((file) => {
    filesPathArr.push(p.join(dirPath, file));
  });
  return filesPathArr;
};
