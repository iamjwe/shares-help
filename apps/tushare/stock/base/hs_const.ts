import axios from 'axios';
import { tushare_token } from '../../tushare.config';
// 接口：hs_const
// 描述：获取沪股通、深股通成分数据
const api_name = 'hs_const';

export type HsConstParams = {
  hs_type: string; // 	类型SH沪股通SZ深股通
  is_new?: string; // 是否最新 1 是 0 否 (默认1)
};

export type HsConstResult = {
  ts_code?: string; // TS代码
  hs_type?: string; // 	沪深港通类型SH沪SZ深
  in_date?: string; // 纳入日期
  out_date?: string; // 剔除日期
  is_new?: string; // 是否最新 1是 0否
};

export type HsConstField =
  | 'ts_code'
  | 'hs_type'
  | 'in_date'
  | 'out_date'
  | 'is_new';

export const getStockBasic = async (
  token: string,
  params?: HsConstParams,
  fields?: HsConstField[] | string,
): Promise<HsConstResult[]> | null => {
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
  const data = await getStockBasic(tushare_token, {
    hs_type: 'SH',
  });
  console.log(data[0], data.length);
}

// test();
