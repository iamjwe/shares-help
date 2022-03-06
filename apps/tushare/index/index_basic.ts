import axios from 'axios';
import { tushare_token } from '../tushare.config';
/*
接口：index_basic
描述：获取指数基础信息。
*/
const api_name = 'index_basic';
export type IndexBasicParams = {
  ts_code?: string; // 指数代码
  name?: string; // 指数简称
  market?: string; // 交易所或服务商(默认SSE)
  publisher?: string; // 发布商
  category?: string; // 指数类别
};
export type IndexBasicResult = {
  ts_code?: string; // TS代码
  name?: string; // 简称
  fullname?: string; // 指数全称
  market?: string; // 市场
  publisher?: string; // 发布方
  index_type?: string; // 指数风格
  category?: string; // 指数类别
  base_date?: string; // 基期
  base_point?: number; // 基点
  list_date?: string; // 发布日期
  weight_rule?: string; // 加权方式
  desc?: string; // 描述
  exp_date?: string; // 终止日期
};
export type IndexBasicField =
  | 'ts_code'
  | 'name'
  | 'fullname'
  | 'market'
  | 'publisher'
  | 'index_type'
  | 'category'
  | 'base_date'
  | 'base_point'
  | 'list_date'
  | 'weight_rule'
  | 'desc'
  | 'exp_date';

export const getIndexBasic = async (
  token: string,
  params?: IndexBasicParams,
  fields?: IndexBasicField[] | string,
): Promise<IndexBasicResult[]> | null => {
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
  const data = await getIndexBasic(tushare_token, {
    ts_code: '399006.SZ',
  });
  console.log(data);
}

// test();
