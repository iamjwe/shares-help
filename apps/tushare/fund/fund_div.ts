import axios from 'axios';
import { tushare_token } from '../tushare.config';
/*
接口：fund_div
描述：获取公募基金分红数据
*/
const api_name = 'fund_div';
export type FundDivParams = {
  ann_date?: string; // 公告日（以下参数四选一）
  ex_date?: string; // 除息日
  pay_date?: string; // 派息日
  ts_code?: string; // 基金代码
};
export type FundDivResult = {
  ts_code?: string; // TS代码
  ann_date?: string; // 公告日期
  imp_anndate?: string; // 分红实施公告日
  base_date?: string; // 分配收益基准日
  div_proc?: string; // 方案进度
  record_date?: string; // 权益登记日
  ex_date?: string; // 除息日
  pay_date?: string; // 派息日
  earpay_date?: string; // 收益支付日
  net_ex_date?: string; // 净值除权日
  div_cash?: number; // 每股派息(元)
  base_unit?: number; // 基准基金份额(万份)
  ear_distr?: number; // 可分配收益(元)
  ear_amount?: number; // 收益分配金额(元)
  account_date?: string; // 红利再投资到账日
  base_year?: string; // 份额基准年度
};
export type FundDivField =
  | 'ts_code'
  | 'ann_date'
  | 'imp_anndate'
  | 'base_date'
  | 'div_proc'
  | 'record_date'
  | 'ex_date'
  | 'pay_date'
  | 'earpay_date'
  | 'net_ex_date'
  | 'div_cash'
  | 'base_unit'
  | 'ear_distr'
  | 'ear_amount'
  | 'account_date'
  | 'base_year';

export const getFundDiv = async (
  token: string,
  params?: FundDivParams,
  fields?: FundDivField[] | string,
): Promise<FundDivResult[]> | null => {
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
  const data = await getFundDiv(tushare_token, {
    ann_date: '20211015',
  });
  console.log(data);
}

// test();
