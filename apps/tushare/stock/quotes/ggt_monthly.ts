import axios from 'axios';
import { tushare_token } from '../../tushare.config';
// 接口：ggt_monthly
// 描述：港股通每月成交信息，数据从2014年开始，到2020年结束
const api_name = 'ggt_monthly';

export type GgtDailyParams = {
  month?: string; // 月度（格式YYYYMM，下同，支持多个输入）
  start_month?: string; // 开始月度
  end_month?: string; // 	结束月度
};

export type GgtDailyResult = {
  month?: string; // 交易日期
  day_buy_amt?: string; // 当月日均买入成交金额（亿元）
  day_buy_vol?: string; // 当月日均买入成交笔数（万笔）
  day_sell_amt?: string; // 当月日均卖出成交金额（亿元）
  day_sell_vol?: string; // 当月日均卖出成交笔数（万笔）
  total_buy_amt?: string; // 总买入成交金额（亿元）
  total_buy_vol?: string; // 总买入成交笔数（万笔）
  total_sell_amt?: string; // 总卖出成交金额（亿元）
  total_sell_vol?: string; // 总卖出成交笔数（万笔）
};

export type GgtDailyField =
  | 'month'
  | 'day_buy_amt'
  | 'day_buy_vol'
  | 'day_sell_amt'
  | 'day_sell_vol'
  | 'total_buy_amt'
  | 'total_buy_vol'
  | 'total_sell_amt'
  | 'total_sell_vol';

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
    start_month: '202012',
  });
  console.log(data);
}

// test();
