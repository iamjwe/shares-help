import axios from 'axios';
import { tushare_token } from '../tushare.config';
/*
接口：index_weight
描述：获取各类指数成分和权重，月度数据 。
来源：指数公司网站公开数据
*/
const api_name = 'index_weight';
export type IndexWeightParams = {
  index_code?: string; // 指数代码 (二选一)
  trade_date?: string; // 交易日期 （二选一）
  start_date?: string; // 开始日期
  end_date?: number; // 结束日期
};
export type IndexWeightResult = {
  index_code?: string; // 指数代码
  con_code?: string; // 成分代码
  trade_date?: string; // 交易日期
  weight?: number; // 权重
};
export type IndexWeightField =
  | 'index_code'
  | 'con_code'
  | 'trade_date'
  | 'weight';

export const getIndexWeight = async (
  token: string,
  params?: IndexWeightParams,
  fields?: IndexWeightField[] | string,
): Promise<IndexWeightResult[]> | null => {
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
  const data = await getIndexWeight(tushare_token, {
    trade_date: '20210930',
  });
  console.log(data);
}

// test();
