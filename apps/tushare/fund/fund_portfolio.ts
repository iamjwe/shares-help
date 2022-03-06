import axios from 'axios';
import { tushare_token } from '../tushare.config';
/*
接口：fund_portfolio
描述：获取公募基金持仓数据，季度更新
*/
const api_name = 'fund_portfolio';
export type FundPortfolioParams = {
  ts_code: string; // 基金代码
  ann_date?: string; // 公告日期（YYYYMMDD格式）
  start_date?: string; // 报告期开始日期（YYYYMMDD格式）
  end_date?: string; // 报告期结束日期（YYYYMMDD格式）
};
export type FundPortfolioResult = {
  ts_code?: string; // TS基金代码
  ann_date?: string; // 公告日期
  end_date?: string; // 截止日期
  symbol?: string; // 股票代码
  mkv?: number; // 持有股票市值(元)
  amount?: number; // 持有股票数量（股）
  stk_mkv_ratio?: number; // 占股票市值比
  stk_float_ratio?: number; // 占流通股本比例
};
export type FundPortfolioField =
  | 'ts_code'
  | 'ann_date'
  | 'end_date'
  | 'symbol'
  | 'mkv'
  | 'amount'
  | 'stk_mkv_ratio'
  | 'stk_float_ratio';

export const getFundPortfolio = async (
  token: string,
  params?: FundPortfolioParams,
  fields?: FundPortfolioField[] | string,
): Promise<FundPortfolioResult[]> | null => {
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
  const data = await getFundPortfolio(tushare_token, {
    ts_code: '516610.SH',
  });
  console.log(data);
}

// test();
