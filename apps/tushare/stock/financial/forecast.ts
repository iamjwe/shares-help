import axios from 'axios';
import { tushare_token } from '../../tushare.config';
/*
接口：forecast
描述：获取业绩预告数据
*/
const api_name = 'forecast';
export type ForecastParams = {
  ts_code?: string; // 股票代码(二选一)
  ann_date?: string; // 公告日期 (二选一)
  start_date?: string; // 公告开始日期
  end_date?: string; // 公告结束日期
  period?: string; // 报告期(每个季度最后一天的日期，比如20171231表示年报)
  type?: string; // 预告类型(预增/预减/扭亏/首亏/续亏/续盈/略增/略减)
};
export type ForecastResult = {
  ts_code?: string; // undefined
  ann_date?: string; // undefined
  end_date?: string; // undefined
  type?: string; // undefined
  p_change_min?: number; // undefined
  p_change_max?: number; // undefined
  net_profit_min?: number; // undefined
  net_profit_max?: number; // undefined
  last_parent_net?: number; // undefined
  first_ann_date?: string; // undefined
  summary?: string; // undefined
  change_reason?: string; // undefined
};
export type ForecastField =
  | 'ts_code'
  | 'ann_date'
  | 'end_date'
  | 'type'
  | 'p_change_min'
  | 'p_change_max'
  | 'net_profit_min'
  | 'net_profit_max'
  | 'last_parent_net'
  | 'first_ann_date'
  | 'summary'
  | 'change_reason';

export const getForecast = async (
  token: string,
  params?: ForecastParams,
  fields?: ForecastField[] | string,
): Promise<ForecastResult[]> | null => {
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
  const data = await getForecast(tushare_token, {
    ts_code: '600132.SH',
  });
  console.log(data);
}

// test();
