import axios from 'axios';
import { tushare_token } from '../../tushare.config';
// 接口：moneyflow，可以通过数据工具调试和查看数据。
// 描述：获取沪深A股票资金流向数据，分析大单小单成交情况，用于判别资金动向
// 限量：单次最大提取4500行记录，总量不限制
const api_name = 'moneyflow';

export type MoneyFlowParams = {
  ts_code?: string; // 	股票代码 （股票和时间参数至少输入一个）
  trade_date?: string; // 交易日期（YYYYMMDD）
  start_date?: string; // 开始日期(YYYYMMDD)
  end_date?: string; // 	结束日期(YYYYMMDD)
};

export type MoneyFlowResult = {
  ts_code?: string; // 	股票代码
  trade_date?: string; // 	交易日期
  buy_sm_vol?: number; // 	小单买入量（手）
  buy_sm_amount?: number; // 小单买入金额（万元）
  sell_sm_vol?: number; // 小单卖出量（手）
  sell_sm_amount?: number; // 	小单卖出金额（万元）
  buy_md_vol?: number; // 中单买入量（手）
  buy_md_amount?: number; // 中单买入金额（万元）
  sell_md_vol?: number; // 中单卖出量（手）
  sell_md_amount?: number; // 中单卖出金额（万元）
  buy_lg_vol?: number; // 大单买入量（手）
  buy_lg_amount?: number; // 大单买入金额（万元）
  sell_lg_vol?: number; // 大单卖出量（手）
  sell_lg_amount?: number; // 大单卖出金额（万元）
  buy_elg_vol?: number; // 	特大单买入量（手）
  buy_elg_amount?: number; // 特大单买入金额（万元）
  sell_elg_vol?: number; // 特大单卖出量（手）
  sell_elg_amount?: number; // 特大单卖出金额（万元）
  net_mf_vol?: number; // 净流入量（手）
  net_mf_amount?: number; // 净流入额（万元）
};

export type MoneyFlowField =
  | 'ts_code'
  | 'trade_date'
  | 'buy_sm_vol	'
  | 'buy_sm_amount'
  | 'sell_sm_vol'
  | 'sell_sm_amount'
  | 'buy_md_vol'
  | 'buy_md_amount'
  | 'sell_md_vol'
  | 'sell_md_amount'
  | 'buy_lg_vol'
  | 'buy_lg_amount'
  | 'sell_lg_vol'
  | 'sell_lg_amount'
  | 'buy_elg_vol'
  | 'buy_elg_amount'
  | 'sell_elg_vol'
  | 'sell_elg_amount'
  | 'net_mf_vol'
  | 'net_mf_amount';

export const getMoneyFlow = async (
  token: string,
  params?: MoneyFlowParams,
  fields?: MoneyFlowField[] | string,
): Promise<MoneyFlowResult[]> | null => {
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
  const data = await getMoneyFlow(tushare_token, {
    ts_code: '600132.SH',
    trade_date: '20211015',
  });
  console.log(data);
}

// test();
