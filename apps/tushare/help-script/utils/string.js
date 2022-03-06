const { json } = require('express');
// 首字母大写
exports.strCase = (str) =>
  str.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase());

// 下划线转换驼峰
exports.toHump = (str) => {
  return str.replace(/\_(\w)/g, function (all, letter) {
    return letter.toUpperCase();
  });
};
// 驼峰转换下划线
exports.toLine = (str) => {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
};

exports.noPercent1 = (percent) => {
  return parseFloat(percent);
};

// 序列化对象（包括方法）
exports.stringify = (obj) => {
  const arr = [];
  Object.keys(obj).forEach((key) => {
    const val = obj[key];
    const valType = typeof val;
    switch (valType) {
      case 'function':
        arr.push(`'${key}': ${String(val)}`);
        break;
      case 'string':
        arr.push(`'${key}': '${val}'`);
        break;
      case 'number':
      case 'boolean':
        arr.push(`'${key}': ${val}`);
        break;
    }
  });
  return `{${arr.join(',')}}`;
};
