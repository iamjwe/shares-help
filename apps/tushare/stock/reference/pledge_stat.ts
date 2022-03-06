import axios from 'axios';
import { tushare_token } from '../../tushare.config';
/*
接口：pledge_stat
描述：获取股票质押统计数据
限量：单次最大1000
*/
const api_name = 'pledge_stat';
export type PledgeStatParams = {
  ts_code?: string; // 股票代码
  end_date?: string; // 截止日期
};
export type PledgeStatResult = {
  ts_code?: string; // TS代码
  end_date?: string; // 截止日期
  pledge_count?: number; // 质押次数
  unrest_pledge?: number; // 无限售股质押数量（万）
  rest_pledge?: number; // 限售股份质押数量（万）
  total_share?: number; // 总股本
  pledge_ratio?: number; // 质押比例
};
export type PledgeStatField =
  | 'ts_code'
  | 'end_date'
  | 'pledge_count'
  | 'unrest_pledge'
  | 'rest_pledge'
  | 'total_share'
  | 'pledge_ratio';

export const getPledgeStat = async (
  token: string,
  params?: PledgeStatParams,
  fields?: PledgeStatField[] | string,
): Promise<PledgeStatResult[]> | null => {
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
  const data = await getPledgeStat(tushare_token, {
    ts_code: '600132.SH',
  });
  console.log(data);
}

// test();
