import axios from 'axios';
import { tushare_token } from '../../tushare.config';
// 接口：new_share
// 描述：获取新股上市列表数据
const api_name = 'new_share';

export type HsConstParams = {
  start_date?: string; // 上网发行开始日期
  end_date?: string; // 上网发行结束日期
};

export type HsConstResult = {
  ts_code?: string; // TS代码
  sub_code?: string; // 	申购代码
  name?: string; // 	名称
  ipo_date?: string; // 上网发行日期
  issue_date?: string; // 上市日期
  amount?: string; // 发行总量（万股）
  market_amount?: string; // 上网发行总量（万股）
  price?: string; // 	发行价格
  pe?: string; // 市盈率
  limit_amount?: string; // 个人申购上限（万股）
  funds?: string; // 募集资金（亿元）
  ballot?: string; // 中签率
};

export type HsConstField =
  | 'ts_code'
  | 'sub_code'
  | 'name'
  | 'ipo_date'
  | 'issue_date'
  | 'amount'
  | 'market_amount'
  | 'price'
  | 'pe'
  | 'limit_amount'
  | 'funds'
  | 'ballot';

export const getStockBasic = async (
  token: string,
  params?: HsConstParams,
  fields?: HsConstField[] | string,
): Promise<HsConstResult[]> | null => {
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
  const data = await getStockBasic(tushare_token, {
    start_date: '20211001',
  });
  console.log(data);
}

// test();
