import axios from 'axios';
import { tushare_token } from '../../tushare.config';
/*
接口：dividend
描述：分红送股数据
*/
const api_name = 'dividend';
export type DividendParams = {
  ts_code?: string; // TS代码
  ann_date?: string; // 公告日
  record_date?: string; // 股权登记日期
  ex_date?: string; // 除权除息日
  imp_ann_date?: string; // 实施公告日
};
export type DividendResult = {
  ts_code?: string; // TS代码
  end_date?: string; // 分红年度
  ann_date?: string; // 预案公告日
  div_proc?: string; // 实施进度
  stk_div?: number; // 每股送转
  stk_bo_rate?: number; // 每股送股比例
  stk_co_rate?: number; // 每股转增比例
  cash_div?: number; // 每股分红（税后）
  cash_div_tax?: number; // 每股分红（税前）
  record_date?: string; // 股权登记日
  ex_date?: string; // 除权除息日
  pay_date?: string; // 派息日
  div_listdate?: string; // 红股上市日
  imp_ann_date?: string; // 实施公告日
  base_date?: string; // 基准日
  base_share?: number; // 基准股本（万）
};
export type DividendField =
  | 'ts_code'
  | 'end_date'
  | 'ann_date'
  | 'div_proc'
  | 'stk_div'
  | 'stk_bo_rate'
  | 'stk_co_rate'
  | 'cash_div'
  | 'cash_div_tax'
  | 'record_date'
  | 'ex_date'
  | 'pay_date'
  | 'div_listdate'
  | 'imp_ann_date'
  | 'base_date'
  | 'base_share';

export const getDividend = async (
  token: string,
  params?: DividendParams,
  fields?: DividendField[] | string,
): Promise<DividendResult[]> | null => {
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
  const data = await getDividend(tushare_token, {
    ts_code: '600132.SH',
  });
  console.log(data);
}

// test();
