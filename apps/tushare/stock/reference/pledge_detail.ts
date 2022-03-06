import axios from 'axios';
import { tushare_token } from '../../tushare.config';
/*
接口：pledge_detail
描述：获取股票质押明细数据
*/
const api_name = 'pledge_detail';
export type PledgeDetailParams = {
  ts_code: string; // 股票代码
};
export type PledgeDetailResult = {
  ts_code?: string; // TS股票代码
  ann_date?: string; // 公告日期
  holder_name?: string; // 股东名称
  pledge_amount?: number; // 质押数量（万股）
  start_date?: string; // 质押开始日期
  end_date?: string; // 质押结束日期
  is_release?: string; // 是否已解押
  release_date?: string; // 解押日期
  pledgor?: string; // 质押方
  holding_amount?: number; // 持股总数（万股）
  pledged_amount?: number; // 质押总数（万股）
  p_total_ratio?: number; // 本次质押占总股本比例
  h_total_ratio?: number; // 持股总数占总股本比例
  is_buyback?: string; // 是否回购
};
export type PledgeDetailField =
  | 'ts_code'
  | 'ann_date'
  | 'holder_name'
  | 'pledge_amount'
  | 'start_date'
  | 'end_date'
  | 'is_release'
  | 'release_date'
  | 'pledgor'
  | 'holding_amount'
  | 'pledged_amount'
  | 'p_total_ratio'
  | 'h_total_ratio'
  | 'is_buyback';

export const getPledgeDetail = async (
  token: string,
  params?: PledgeDetailParams,
  fields?: PledgeDetailField[] | string,
): Promise<PledgeDetailResult[]> | null => {
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
  const data = await getPledgeDetail(tushare_token, {
    ts_code: '603501.SH',
  });
  console.log(data);
}

// test();
