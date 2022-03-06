import axios from 'axios';
import { tushare_token } from '../tushare.config';
/*
接口：fund_nav，可以通过数据工具调试和查看数据。
描述：获取公募基金净值数据
*/
const api_name = 'fund_nav';
export type FundNavParams = {
  ts_code?: string; // TS基金代码 （二选一）
  nav_date?: string; // 净值日期 （二选一）
  market?: string; // E场内 O场外
  start_date?: string; // 净值开始日期
  end_date?: string; // 净值结束日期
};
export type FundNavResult = {
  ts_code?: string; // TS代码
  ann_date?: string; // 公告日期
  nav_date?: string; // 净值日期
  unit_nav?: number; // 单位净值
  accum_nav?: number; // 累计净值
  accum_div?: number; // 累计分红
  net_asset?: number; // 资产净值
  total_netasset?: number; // 合计资产净值
  adj_nav?: number; // 复权单位净值
};
export type FundNavField =
  | 'ts_code'
  | 'ann_date'
  | 'nav_date'
  | 'unit_nav'
  | 'accum_nav'
  | 'accum_div'
  | 'net_asset'
  | 'total_netasset'
  | 'adj_nav';

export const getFundNav = async (
  token: string,
  params?: FundNavParams,
  fields?: FundNavField[] | string,
): Promise<FundNavResult[]> | null => {
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
  const data = await getFundNav(tushare_token, {
    nav_date: '20211015',
  });
  console.log(data[0], data.length);
}

// test();
