import axios from 'axios';
import { tushare_token } from '../../tushare.config';
/*
接口：concept
描述：获取概念股分类，目前只有ts一个来源，未来将逐步增加来源
*/
const api_name = 'concept';
export type ConceptParams = {
  src?: string; // 来源，默认为ts
};
export type ConceptResult = {
  code?: string; // 概念分类ID
  name?: string; // 概念分类名称
  src?: string; // 来源
};
export type ConceptField = 'code' | 'name' | 'src';

export const getConcept = async (
  token: string,
  params?: ConceptParams,
  fields?: ConceptField[] | string,
): Promise<ConceptResult[]> | null => {
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
  const data = await getConcept(tushare_token, {});
  console.log(data);
}

// test();
