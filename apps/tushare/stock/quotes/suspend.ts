import axios from 'axios';
import { tushare_token } from '../../tushare.config';
// 接口：suspend
// 更新时间：不定期
// 描述：获取股票每日停复牌信息
const api_name = 'suspend';

export type SuspendParams = {
  ts_code?: string; // 	股票代码(三选一)
  suspend_date?: string; // 停牌日期(三选一)
  resume_date?: string; // 	复牌日期(三选一)
};

export type SuspendResult = {
  ts_code?: string; // 	股票代码
  suspend_date?: string; // 	停牌日期
  resume_date?: number; // 	复牌日期
  ann_date?: number; // 公告日期
  suspend_reason?: number; // 停牌原因
  reason_type?: number; // 	停牌原因类别
};

export type SuspendField =
  | 'ts_code'
  | 'suspend_date'
  | 'resume_date	'
  | 'ann_date'
  | 'suspend_reason'
  | 'reason_type';

export const getSuspend = async (
  token: string,
  params?: SuspendParams,
  fields?: SuspendField[] | string,
): Promise<SuspendResult[]> | null => {
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
  const data = await getSuspend(tushare_token, {
    ts_code: '600132.SH',
  });
  console.log(data);
}

// test();
