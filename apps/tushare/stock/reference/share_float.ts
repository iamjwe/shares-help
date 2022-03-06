import axios from 'axios';
import { tushare_token } from '../../tushare.config';
/*
接口：share_float
描述：获取限售股解禁
*/
const api_name = 'share_float';
export type ShareFloatParams = {
  ts_code?: string; // TS股票代码（至少输入一个参数）
  ann_date?: string; // 公告日期（日期格式：YYYYMMDD，下同）
  float_date?: string; // 解禁日期
  start_date?: string; // 解禁开始日期
  end_date?: string; // 解禁结束日期
};
export type ShareFloatResult = {
  ts_code?: string; // TS代码
  ann_date?: string; // 公告日期
  float_date?: string; // 解禁日期
  float_share?: number; // 流通股份
  float_ratio?: number; // 流通股份占总股本比率
  holder_name?: string; // 股东名称
  share_type?: string; // 股份类型
};
export type ShareFloatField =
  | 'ts_code'
  | 'ann_date'
  | 'float_date'
  | 'float_share'
  | 'float_ratio'
  | 'holder_name'
  | 'share_type';

export const getShareFloat = async (
  token: string,
  params?: ShareFloatParams,
  fields?: ShareFloatField[] | string,
): Promise<ShareFloatResult[]> | null => {
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
  const data = await getShareFloat(tushare_token, {
    ts_code: '603501.SH',
  });
  console.log(data);
}

// test();
