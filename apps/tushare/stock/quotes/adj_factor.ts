import axios from 'axios';
import { tushare_token } from '../../tushare.config';
// 接口：adj_factor，可以通过数据工具调试和查看数据。
// 更新时间：早上9点30分
// 描述：获取股票复权因子，可提取单只股票全部历史复权因子，也可以提取单日全部股票的复权因子。
const api_name = 'adj_factor';

export type AdjFactorParams = {
  ts_code?: string; // 	股票代码
  trade_date?: string; // 交易日期（YYYYMMDD）
  start_date?: string; // 开始日期(YYYYMMDD)
  end_date?: string; // 	结束日期(YYYYMMDD)
};

export type AdjFactorResult = {
  ts_code?: string; // 	股票代码
  trade_date?: string; // 交易日期
  adj_factor?: number; // 复权因子
};

export type AdjFactorField = 'ts_code' | 'trade_date' | 'adj_factor';

export const getAdjFactor = async (
  token: string,
  params?: AdjFactorParams,
  fields?: AdjFactorField[] | string,
): Promise<AdjFactorResult[]> | null => {
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
  const data = await getAdjFactor(tushare_token, {
    // ts_code: '600132.SH',
    ts_code: '000598.SZ',
    start_date: '20210104',
  });
  console.log(data[0], data[data.length - 1], data.length);
}

// test();
