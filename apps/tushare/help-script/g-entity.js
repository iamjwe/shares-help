const { strCase, toHump } = require('./utils/string');
const { getPathAbsolute, getPathConcat } = require('./utils/path');
const { writeFile } = require('./utils/file');
const { api_name, reqResult } = require('./parse-config');

function parseKv() {
  let result = '';
  const datas = [];
  const trs = reqResult.match(/<tr[^>]*>[\s\S]*?<\/tr>/g);
  trs &&
    trs.forEach((tr) => {
      const trData = [];
      const tds = tr.match(/<td[^>]*>[\s\S]*?<\/td>/g);
      if (!tds) return;
      tds.forEach((td) => {
        if (td === '') return;
        const tdData = td.match(/<td.*>(.*)<\/td>/)[1];
        trData.push(tdData);
      });
      datas.push(trData);
    });
  datas.forEach((tr) => {
    let entityKv = '';
    const column = tr[0]; // 字段名
    const type = tr[1]; // 字段类型
    const tip = tr[tr.length - 1]; // 字段描述
    entityKv +=
      column === 'ts_code' || column === 'trade_date' ? '@Index()\n' : '';
    entityKv += `@Column({ type: '${type === 'str' ? 'varchar' : 'float'}' ${
      column === 'ts_code' ? ', width: 10' : ''
    }, ${
      column !== 'ts_code' || 'trade_date' ? 'nullable: true' : ''
    }, comment: '${tip}' })\n`;
    entityKv += column;
    entityKv += ': ';
    entityKv += type === 'str' ? 'string' : 'number';
    entityKv += ';';
    entityKv += '\n';
    result += entityKv;
  });
  result += '}\n';
  return result;
}

function main() {
  let str = `import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
  @Entity()
  export default class ${toHump(strCase(api_name))} {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '主键' })
    id: number;\n`;
  str += parseKv();
  console.log(str);
  writeFile(
    getPathConcat(
      getPathAbsolute('/apps/tushare/index'),
      `${api_name}.entity.ts`,
    ),
    str,
  );
}

main();
