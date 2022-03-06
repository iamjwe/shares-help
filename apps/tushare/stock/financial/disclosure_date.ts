import axios from 'axios';
import { tushare_token } from '../../tushare.config';
/*
接口：disclosure_date
描述：获取财报披露计划日期
*/
const api_name = 'disclosure_date';
export type DisclosureDateParams = {
  ts_code?: string; // TS股票代码
  end_date?: string; // 财报周期（比如20181231表示2018年年报，20180630表示中报)
  pre_date?: string; // 计划披露日期
  actual_date?: string; // 实际披露日期
};
export type DisclosureDateResult = {
  ts_code?: string; // TS代码
  ann_date?: string; // 最新披露公告日
  end_date?: string; // 报告期
  pre_date?: string; // 预计披露日期
  actual_date?: string; // 实际披露日期
  modify_date?: string; // 披露日期修正记录
};
export type DisclosureDateField =
  | 'ts_code'
  | 'ann_date'
  | 'end_date'
  | 'pre_date'
  | 'actual_date'
  | 'modify_date';

export const getDisclosureDate = async (
  token: string,
  params?: DisclosureDateParams,
  fields?: DisclosureDateField[] | string,
): Promise<DisclosureDateResult[]> | null => {
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
  const data = await getDisclosureDate(tushare_token, {
    ts_code: '600132.SH',
  });
  console.log(data);
}

// test();
