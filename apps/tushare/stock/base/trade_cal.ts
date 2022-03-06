import axios from 'axios';
import { tushare_token } from '../../tushare.config';
// 接口：trade_cal
// 描述：获取各大交易所交易日历数据,默认提取的是上交所
const api_name = 'trade_cal';

export type TradeCalParams = {
  exchange?: string; // 交易所 SSE上交所（默认）,SZSE深交所,CFFEX 中金所,SHFE 上期所,CZCE 郑商所,DCE 大商所,INE 上能源
  start_date?: string; // 开始日期 （格式：YYYYMMDD 下同）
  end_date?: string; // 结束日期
  is_open?: number; // 是否交易 '0'休市 '1'交易
};

export type TradeCalResult = {
  exchange?: string; // 交易所 SSE上交所 SZSE深交所
  cal_date?: string; // 日历日期
  is_open?: number; // 是否交易 0休市 1交易
  pretrade_date?: string; // 	上一个交易日
};

export type TradeCalField =
  | 'exchange'
  | 'cal_date'
  | 'is_open'
  | 'pretrade_date';

export const getTradeCal = async (
  token: string,
  params?: TradeCalParams,
  fields?: TradeCalField[] | string,
): Promise<TradeCalResult[]> | null => {
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
  const data = await getTradeCal(
    tushare_token,
    {
      start_date: '20210920',
      is_open: 1,
    },
    ['cal_date', 'is_open', 'pretrade_date'],
  );
  console.log(data);
}

// test();
