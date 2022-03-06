import axios from 'axios';
import { tushare_token } from '../../tushare.config';
/*
接口：stk_account（官方已停止更新，数据截至到20190222）
描述：获取股票账户开户数据，统计周期为一周
*/
const api_name = 'stk_account';
export type StkAccountParams = {
  date?: string; // 日期
  start_date?: string; // 开始日期
  end_date?: string; // 结束日期
};
export type StkAccountResult = {
  date?: string; // 统计周期
  weekly_new?: number; // 本周新增（万）
  total?: number; // 期末总账户数（万）
  weekly_hold?: number; // 本周持仓账户数（万）
  weekly_trade?: number; // 本周参与交易账户数（万）
};
export type StkAccountField =
  | 'date'
  | 'weekly_new'
  | 'total'
  | 'weekly_hold'
  | 'weekly_trade';

export const getStkAccount = async (
  token: string,
  params?: StkAccountParams,
  fields?: StkAccountField[] | string,
): Promise<StkAccountResult[]> | null => {
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
  const data = await getStkAccount(tushare_token, {
    end_date: '20211001',
  });
  console.log(data);
}

// test();
