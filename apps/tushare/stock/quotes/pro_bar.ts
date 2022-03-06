import axios from 'axios';
import { tushare_token } from '../../tushare.config';
// 接口名称 ：pro_bar（！http还不支持）
// 接口说明 ：复权行情通过通用行情接口实现，利用Tushare Pro提供的复权因子进行计算
const api_name = 'pro_bar';

export type ProBarParams = {
  ts_code: string; // 	股票代码（支持多个股票同时提取，逗号分隔）
  asset: string; // 	资产类别：E股票 I沪深指数 C数字货币 FT期货 FD基金 O期权，默认E
  freq: string; // 	数据频度 ：1MIN表示1分钟（1/5/15/30/60分钟） D日线 ，默认D
  start_date?: string; // 开始日期(YYYYMMDD)
  end_date?: string; // 	结束日期(YYYYMMDD)
  adj?: string; // 	复权类型(只针对股票)：None未复权 qfq前复权 hfq后复权 , 默认None
  ma?: string; // 	均线，支持任意周期的均价和均量，输入任意合理int数值
};

export type ProBarResult = {
  ts_code?: string; // 	股票代码
  trade_date?: string; // 	交易日期
  open?: number; // 开盘价
  high?: number; // 最高价
  low?: number; // 最低价
  close?: number; // 	收盘价
  pre_close?: number; // 昨收价
  change?: number; // 	涨跌额
  pct_chg?: number; // 涨跌幅 （未复权，如果是复权请用 通用行情接口 ）
  vol?: number; // 成交量 （手）
  amount?: number; // 成交额 （千元）
};

export type ProBarField =
  | 'ts_code'
  | 'trade_date'
  | 'open	'
  | 'high'
  | 'low'
  | 'close'
  | 'pre_close'
  | 'change'
  | 'pct_chg'
  | 'vol'
  | 'amount';

export const getProBar = async (
  token: string,
  params?: ProBarParams,
  fields?: ProBarField[] | string,
): Promise<ProBarResult[]> | null => {
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
  const data = await getProBar(tushare_token, {
    ts_code: '600132.SH',
    freq: '60MIN',
    asset: 'E',
    start_date: '20211001',
  });
  console.log(data);
}

// test();
