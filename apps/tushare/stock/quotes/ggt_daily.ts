import axios from 'axios';
import { tushare_token } from '../../tushare.config';
// 接口：ggt_daily
// 描述：获取港股通每日成交信息，数据从2014年开始
const api_name = 'ggt_daily';

export type GgtDailyParams = {
  trade_date?: string; // 交易日期（YYYYMMDD）
  start_date?: string; // 开始日期(YYYYMMDD)
  end_date?: string; // 	结束日期(YYYYMMDD)
};

export type GgtDailyResult = {
  trade_date?: string; // 交易日期
  buy_amount?: number; // 买入成交金额（亿元）
  buy_volume?: number; // 买入成交笔数（万笔）
  sell_amount?: number; // 卖出成交金额（亿元）
  sell_volume?: number; // 卖出成交笔数（万笔）
};

export type GgtDailyField =
  | 'trade_date'
  | 'buy_amount'
  | 'buy_volume'
  | 'sell_amount'
  | 'sell_volume';

export const getGgtDaily = async (
  token: string,
  params?: GgtDailyParams,
  fields?: GgtDailyField[] | string,
): Promise<GgtDailyResult[]> | null => {
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
  const data = await getGgtDaily(tushare_token, {
    start_date: '20211001',
  });
  console.log(data);
}

// test();
