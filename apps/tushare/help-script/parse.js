const { strCase, toHump } = require('./utils/string');
const { getPathAbsolute, getPathConcat } = require('./utils/path');
const { writeFile } = require('./utils/file');
const { api_name, api_desc, reqParams, reqResult } = require('./config');

function parseParams() {
  let result = `export type ${toHump(strCase(api_name))}Params = {\n`;
  const datas = [];
  const trs = reqParams.match(/<tr[^>]*>[\s\S]*?<\/tr>/g);
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
    let row = '';
    const column = tr[0];
    const type = tr[1];
    const require = tr[2];
    const tip = tr[3];
    row += column;
    if (require !== 'Y') row += '?';
    row += ': ';
    row += type === 'str' ? 'string' : 'number';
    row += ';';
    row += `// ${tip}`;
    row += '\n';
    result += row;
  });
  result += '};\n';
  return result;
}

function parseResult() {
  let result = `export type ${toHump(strCase(api_name))}Result = {\n`;
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
    let row = '';
    const column = tr[0];
    const type = tr[1];
    const tip = tr[tr.length - 1];
    row += column;
    row += '?';
    row += ': ';
    row += type === 'str' ? 'string' : 'number';
    row += ';';
    row += `// ${tip}`;
    row += '\n';
    result += row;
  });
  result += '}\n';
  return result;
}
// export type AdjFactorField = 'ts_code' | 'trade_date' | 'adj_factor';
function parseFields() {
  let result = `export type ${toHump(strCase(api_name))}Field = `;
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
    let row = '';
    const column = tr[0];
    row += `\n| '${column}'`;
    result += row;
  });
  result += ';\n';
  console.log(result);
  return result;
}

function main() {
  let str = `import axios from 'axios';\n`;
  str += `/*\n${api_desc}\n*/\n`;
  str += `const api_name = '${api_name}';\n`;
  const paramStr = parseParams();
  const resultStr = parseResult();
  const fieldStr = parseFields();
  str += paramStr;
  str += resultStr;
  str += fieldStr;
  const testStr = `
  export const get${toHump(strCase(api_name))} = async (
    token: string,
    params?: ${toHump(strCase(api_name))}Params,
    fields?: ${toHump(strCase(api_name))}Field[] | string,
  ): Promise<${toHump(strCase(api_name))}Result[]> | null => {
    let result = null;
    if (Array.isArray(fields)) {
      fields = fields.join(',');
    }
    const reqBody = {
      api_name,
      token,
      params: params ? params : {},
      fields: fields,
    };
    await axios
      .post('http://api.waditu.com', reqBody)
      .then((res) => {
        const { code, msg, data } = res.data;
        if (code !== 0) {
          console.log('reqError', msg, reqBody);
          result = null;
        }
        const { fields, items } = data;
        const mapResult = items.map((itemArr) => {
          const obj = {};
          for (let i = 0; i < itemArr.length; i++) {
            obj[fields[i]] = itemArr[i];
          }
          return obj;
        });
        result = mapResult;
      })
      .catch((error) => {
        console.log('reqBody', reqBody);
        console.log(error);
        result = null;
      });
    return result;
  };

  async function test() {
    const data = await get${toHump(strCase(api_name))}(
      tushare_token,
      {
        ts_code: '399300.SZ',
      },
    );
    console.log(data);
  }
  
  test();`;
  str += testStr;
  console.log(str);
  writeFile(getPathConcat(getPathAbsolute('/dto/fund'), `${api_name}.ts`), str);
}

main();
