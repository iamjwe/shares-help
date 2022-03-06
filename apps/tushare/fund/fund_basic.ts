import axios from 'axios';
import { tushare_token } from '../tushare.config';
/*
接口：fund_basic
描述：获取公募基金数据列表，包括场内和场外基金
*/
const api_name = 'fund_basic';
export type FundBasicParams = {
  market?: string; // 交易市场: E场内 O场外（默认E）
  status?: string; // 存续状态 D摘牌 I发行 L上市中
};
export type FundBasicResult = {
  ts_code?: string; // 基金代码
  name?: string; // 简称
  management?: string; // 管理人
  custodian?: string; // 托管人
  fund_type?: string; // 投资类型
  found_date?: string; // 成立日期
  due_date?: string; // 到期日期
  list_date?: string; // 上市时间
  issue_date?: string; // 发行日期
  delist_date?: string; // 退市日期
  issue_amount?: number; // 发行份额(亿)
  m_fee?: number; // 管理费
  c_fee?: number; // 托管费
  duration_year?: number; // 存续期
  p_value?: number; // 面值
  min_amount?: number; // 起点金额(万元)
  exp_return?: number; // 预期收益率
  benchmark?: string; // 业绩比较基准
  status?: string; // 存续状态D摘牌 I发行 L已上市
  invest_type?: string; // 投资风格
  type?: string; // 基金类型
  trustee?: string; // 受托人
  purc_startdate?: string; // 日常申购起始日
  redm_startdate?: string; // 日常赎回起始日
  market?: string; // E场内O场外
};
export type FundBasicField =
  | 'ts_code'
  | 'name'
  | 'management'
  | 'custodian'
  | 'fund_type'
  | 'found_date'
  | 'due_date'
  | 'list_date'
  | 'issue_date'
  | 'delist_date'
  | 'issue_amount'
  | 'm_fee'
  | 'c_fee'
  | 'duration_year'
  | 'p_value'
  | 'min_amount'
  | 'exp_return'
  | 'benchmark'
  | 'status'
  | 'invest_type'
  | 'type'
  | 'trustee'
  | 'purc_startdate'
  | 'redm_startdate'
  | 'market';

export const getFundBasic = async (
  token: string,
  params?: FundBasicParams,
  fields?: FundBasicField[] | string,
): Promise<FundBasicResult[]> | null => {
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
  const data = await getFundBasic(tushare_token, {
    market: 'E',
    status: 'L',
  });
  const newData = data.filter((row) => {
    return row.name.match(/ETF/);
  });
  console.log(newData[0], newData.length);
}

// test();
