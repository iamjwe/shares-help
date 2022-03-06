import axios from 'axios';
import { tushare_token } from '../tushare.config';
/*
接口：ths_index
描述：获取同花顺板块指数。注：数据版权归属同花顺，如做商业用途，请主动联系同花顺，如需帮助请联系微信migedata 。
限量：本接口需获得600积分，单次最大5000，一次可提取全部数据，请勿循环提取。
*/
const api_name = 'ths_index';
export type ThsIndexParams = {
  ts_code?: string; // 指数代码
  exchange?: string; // 市场类型A-a股 HK-港股 US-美股
  type?: string; // 指数类型 N-板块指数 I-行业指数 S-同花顺特色指数
};
export type ThsIndexResult = {
  ts_code?: string; // 代码
  name?: string; // 名称
  count?: number; // 成分个数
  exchange?: string; // 交易所
  list_date?: string; // 上市日期
  type?: string; // N概念指数S特色指数
};
export type ThsIndexField =
  | 'ts_code'
  | 'name'
  | 'count'
  | 'exchange'
  | 'list_date'
  | 'type';

export const getThsIndex = async (
  token: string,
  params?: ThsIndexParams,
  fields?: ThsIndexField[] | string,
): Promise<ThsIndexResult[]> | null => {
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
  const data = await getThsIndex(tushare_token, {});
  console.log(data);
}

// test();
