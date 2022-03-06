import axios from 'axios';
import { tushare_token } from '../../tushare.config';
// 接口：moneyflow_hsgt，可以通过数据工具调试和查看数据。
// 描述：获取沪股通、深股通、港股通每日资金流向数据，每次最多返回300条记录，总量不限制。
const api_name = 'moneyflow_hsgt';

export type MoneyflowHsgtParams = {
  trade_date?: string; // 交易日期（YYYYMMDD）
  start_date?: string; // 开始日期(YYYYMMDD)
  end_date?: string; // 	结束日期(YYYYMMDD)
};

export type MoneyflowHsgtResult = {
  trade_date?: string; // 交易日期
  ggt_ss?: string; // 	港股通（上海）
  ggt_sz?: number; // 港股通（深圳）
  hgt?: number; // 沪股通（百万元）
  sgt?: number; // 深股通（百万元）
  north_money?: number; // 北向资金（百万元）
  south_money?: number; // 	南向资金（百万元）
};

export type MoneyflowHsgtField =
  | 'trade_date'
  | 'ggt_ss'
  | 'ggt_sz	'
  | 'hgt'
  | 'sgt'
  | 'north_money'
  | 'south_money';

export const getMoneyflowHsgt = async (
  token: string,
  params?: MoneyflowHsgtParams,
  fields?: MoneyflowHsgtField[] | string,
): Promise<MoneyflowHsgtResult[]> | null => {
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
  const data = await getMoneyflowHsgt(tushare_token, {
    start_date: '20211001',
  });
  console.log(data);
}

// test();
