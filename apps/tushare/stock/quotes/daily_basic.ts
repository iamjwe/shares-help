import axios from 'axios';
import { tushare_token } from '../../tushare.config';
// 接口：daily_basic，可以通过数据工具调试和查看数据。
// 更新时间：交易日每日15点～17点之间
// 描述：获取全部股票每日重要的基本面指标，可用于选股分析、报表展示等。
const api_name = 'daily_basic';

export type DailyBasicParams = {
  ts_code?: string; // 	股票代码（二选一）
  trade_date?: string; // 交易日期 （二选一）
  start_date?: string; // 开始日期(YYYYMMDD)
  end_date?: string; // 	结束日期(YYYYMMDD)
};

export type DailyBasicResult = {
  ts_code?: string; // 	TS股票代码
  trade_date?: string; // 交易日期
  close?: number; // 当日收盘价
  turnover_rate?: number; // 换手率（%）
  turnover_rate_f?: number; // 换手率（自由流通股）
  volume_ratio?: number; // 量比
  pe?: number; // 市盈率（总市值/净利润， 亏损的PE为空）
  pe_ttm?: number; // 市盈率（TTM，亏损的PE为空）
  pb?: number; // 市净率（总市值/净资产）
  ps?: number; // 市销率
  ps_ttm?: number; // 市销率（TTM）
  dv_ratio?: number; // 股息率 （%）
  dv_ttm?: number; // 股息率（TTM）（%）
  total_share?: number; // 总股本 （万股）
  float_share?: number; // 流通股本 （万股）
  free_share?: number; // 自由流通股本 （万）
  total_mv?: number; // 总市值 （万元）
  circ_mv?: number; // 	流通市值（万元）
};

export type DailyBasicField =
  | 'ts_code'
  | 'trade_date'
  | 'close	'
  | 'turnover_rate'
  | 'turnover_rate_f'
  | 'volume_ratio'
  | 'pe'
  | 'pe_ttm'
  | 'pb'
  | 'ps'
  | 'ps_ttm'
  | 'dv_ratio'
  | 'dv_ttm'
  | 'total_share'
  | 'float_share'
  | 'free_share'
  | 'total_mv'
  | 'circ_mv';

export const getDailyBasic = async (
  token: string,
  params?: DailyBasicParams,
  fields?: DailyBasicField[] | string,
): Promise<DailyBasicResult[]> | null => {
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
      // console.log('reqBody', reqBody);
      // console.log(error);
      result = null;
    });
  return result;
};

async function test() {
  const data = await getDailyBasic(tushare_token, {
    ts_code: '600132.SH',
    trade_date: '20211015',
  });
  console.log(data);
}

// test();
