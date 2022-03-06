import axios from 'axios';
import { tushare_token } from '../../tushare.config';
// 接口：suspend_d
// 更新时间：不定期
// 描述：按日期方式获取股票每日停复牌信息
const api_name = 'suspend_d';

export type SuspendDParams = {
  ts_code?: string; // 	股票代码(可输入多值)
  trade_date?: string; // 交易日日期
  start_date?: string; // 停复牌查询开始日期
  end_date?: string; // 停复牌查询结束日期
  suspend_type?: string; // 停复牌类型：S-停牌,R-复牌
};

export type SuspendDResult = {
  ts_code?: string; // 	股票代码
  trade_date?: string; // 停复牌日期
  suspend_timing?: number; // 日内停牌时间段
  suspend_type?: number; // 停复牌类型：S-停牌，R-复牌
};

export type SuspendDField =
  | 'ts_code'
  | 'trade_date'
  | 'suspend_timing	'
  | 'suspend_type';

export const getSuspendD = async (
  token: string,
  params?: SuspendDParams,
  fields?: SuspendDField[] | string,
): Promise<SuspendDResult[]> | null => {
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
  const data = await getSuspendD(tushare_token, {
    ts_code: '600132.SH',
  });
  console.log(data);
}

// test();
