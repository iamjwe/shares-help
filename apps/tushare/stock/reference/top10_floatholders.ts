import axios from 'axios';
import { tushare_token } from '../../tushare.config';
/*
接口：top10_floatholders
描述：获取上市公司前十大流通股东数据。
*/
const api_name = 'top10_floatholders';
export type Top10FloatholdersParams = {
  ts_code: string; // TS代码
  period?: string; // 报告期
  ann_date?: string; // 公告日期
  start_date?: string; // 报告期开始日期
  end_date?: string; // 报告期结束日期
};
export type Top10FloatholdersResult = {
  ts_code?: string; // TS股票代码
  ann_date?: string; // 公告日期
  end_date?: string; // 报告期
  holder_name?: string; // 股东名称
  hold_amount?: number; // 持有数量（股）
};
export type Top10FloatholdersField =
  | 'ts_code'
  | 'ann_date'
  | 'end_date'
  | 'holder_name'
  | 'hold_amount';

export const getTop10Floatholders = async (
  token: string,
  params?: Top10FloatholdersParams,
  fields?: Top10FloatholdersField[] | string,
): Promise<Top10FloatholdersResult[]> | null => {
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
  const data = await getTop10Floatholders(tushare_token, {
    ts_code: '600132.SH',
  });
  console.log(data);
}

// test();
