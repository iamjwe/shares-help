import axios from 'axios';
import { tushare_token } from '../tushare.config';
/*
接口：index_member
描述：申万行业成分
*/
const api_name = 'index_member';
export type IndexMemberParams = {
  index_code?: string; // 指数代码
  ts_code?: string; // 股票代码
  is_new?: string; // 是否最新（默认为“Y是”）
};
export type IndexMemberResult = {
  index_code?: string; // 指数代码
  index_name?: string; // 指数名称
  con_code?: string; // 成分股票代码
  con_name?: string; // 成分股票名称
  in_date?: string; // 纳入日期
  out_date?: string; // 剔除日期
  is_new?: string; // 是否最新Y是N否
};
export type IndexMemberField =
  | 'index_code'
  | 'index_name'
  | 'con_code'
  | 'con_name'
  | 'in_date'
  | 'out_date'
  | 'is_new';

export const getIndexMember = async (
  token: string,
  params?: IndexMemberParams,
  fields?: IndexMemberField[] | string,
): Promise<IndexMemberResult[]> | null => {
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
  const data = await getIndexMember(tushare_token, {
    index_code: '850531.SI',
  });
  console.log(data);
}

// test();
