import axios from 'axios';
import { tushare_token } from '../../tushare.config';
/*
接口：stk_holdernumber
描述：获取上市公司股东户数数据，数据不定期公布
*/
const api_name = 'stk_holdernumber';
export type StkHoldernumberParams = {
  ts_code?: string; // TS股票代码
  enddate?: string; // 截止日期
  start_date?: string; // 公告开始日期
  end_date?: string; // 公告结束日期
};
export type StkHoldernumberResult = {
  ts_code?: string; // TS股票代码
  ann_date?: string; // 公告日期
  end_date?: string; // 截止日期
  holder_num?: number; // 股东户数
};
export type StkHoldernumberField =
  | 'ts_code'
  | 'ann_date'
  | 'end_date'
  | 'holder_num';

export const getStkHoldernumber = async (
  token: string,
  params?: StkHoldernumberParams,
  fields?: StkHoldernumberField[] | string,
): Promise<StkHoldernumberResult[]> | null => {
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
  const data = await getStkHoldernumber(tushare_token, {
    ts_code: '600132.SH',
  });
  console.log(data);
}

// test();
