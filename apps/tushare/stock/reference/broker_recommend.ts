import axios from 'axios';
import { tushare_token } from '../../tushare.config';
/*
接口：broker_recommend
描述：每月初获取券商月度金股
*/
const api_name = 'broker_recommend';
export type BrokerRecommendParams = {
  month: string; // 月度（YYYYMM）
};
export type BrokerRecommendResult = {
  month?: string; // 月度
  broker?: string; // 券商
  ts_code?: string; // 股票代码
  name?: string; // 股票简称
};
export type BrokerRecommendField = 'month' | 'broker' | 'ts_code' | 'name';

export const getBrokerRecommend = async (
  token: string,
  params?: BrokerRecommendParams,
  fields?: BrokerRecommendField[] | string,
): Promise<BrokerRecommendResult[]> | null => {
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
  const data = await getBrokerRecommend(tushare_token, {
    month: '202109',
  });
  console.log(data);
}

// test();
