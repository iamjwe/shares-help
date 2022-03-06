import axios from 'axios';
import { tushare_token } from '../tushare.config';
/*
接口：ths_member
描述：获取同花顺概念板块成分列表注：数据版权归属同花顺，如做商业用途，请主动联系同花顺。
限量：用户积累5000积分可调取，可按概念板块代码循环提取所有成分
*/
const api_name = 'ths_member';
export type ThsMemberParams = {
  ts_code?: string; // 板块指数代码
};
export type ThsMemberResult = {
  ts_code?: string; // 指数代码
  code?: string; // 股票代码
  name?: string; // 股票名称
  weight?: number; // 权重
  in_date?: string; // 纳入日期
  out_date?: string; // 剔除日期
  is_new?: string; // 是否最新Y是N否
};
export type ThsMemberField =
  | 'ts_code'
  | 'code'
  | 'name'
  | 'weight'
  | 'in_date'
  | 'out_date'
  | 'is_new';

export const getThsMember = async (
  token: string,
  params?: ThsMemberParams,
  fields?: ThsMemberField[] | string,
): Promise<ThsMemberResult[]> | null => {
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
  const data = await getThsMember(tushare_token, { ts_code: '885937.TI' });
  console.log(data);
}

// test();
