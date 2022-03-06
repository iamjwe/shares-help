import axios from 'axios';
import { tushare_token } from '../../tushare.config';
/*
接口：repurchase
描述：获取上市公司回购股票数据
*/
const api_name = 'repurchase';
export type RepurchaseParams = {
  ann_date?: string; // 公告日期（任意填参数，如果都不填，单次默认返回2000条）
  start_date?: string; // 公告开始日期
  end_date?: string; // 公告结束日期
};
export type RepurchaseResult = {
  ts_code?: string; // TS代码
  ann_date?: string; // 公告日期
  end_date?: string; // 截止日期
  proc?: string; // 进度
  exp_date?: string; // 过期日期
  vol?: number; // 回购数量
  amount?: number; // 回购金额
  high_limit?: number; // 回购最高价
  low_limit?: number; // 回购最低价
};
export type RepurchaseField =
  | 'ts_code'
  | 'ann_date'
  | 'end_date'
  | 'proc'
  | 'exp_date'
  | 'vol'
  | 'amount'
  | 'high_limit'
  | 'low_limit';

export const getRepurchase = async (
  token: string,
  params?: RepurchaseParams,
  fields?: RepurchaseField[] | string,
): Promise<RepurchaseResult[]> | null => {
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
  const data = await getRepurchase(tushare_token, {
    start_date: '20211001',
  });
  console.log(data);
}

// test();
