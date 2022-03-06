import axios from 'axios';
import { tushare_token } from '../../tushare.config';
// 接口：stk_rewards
// 描述：获取上市公司管理层薪酬和持股
const api_name = 'stk_rewards';

export type StkRewardsParams = {
  ts_code: string; // TS股票代码，支持单个或多个代码输入
  end_date?: string; // 报告期
};

export type StkRewardsResult = {
  ts_code?: string; // TS股票代码
  ann_date?: string; // 公告日期
  end_date?: string; // 	截止日期
  name?: string; // 姓名
  title?: string; // 职务
  reward?: string; // 报酬
  hold_vol?: string; // 	持股数
};

export type StkRewardsField =
  | 'ts_code'
  | 'ann_date'
  | 'end_date'
  | 'name'
  | 'title'
  | 'reward'
  | 'hold_vol';

export const getStkRewards = async (
  token: string,
  params?: StkRewardsParams,
  fields?: StkRewardsField[] | string,
): Promise<StkRewardsResult[]> | null => {
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
  const data = await getStkRewards(tushare_token, {
    ts_code: '600132.SH',
  });
  console.log(data);
}

// test();
