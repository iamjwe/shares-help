import axios from 'axios';
import { tushare_token } from '../../tushare.config';
/*
接口：express
描述：获取上市公司业绩快报
*/
const api_name = 'express';
export type ExpressParams = {
  ts_code: string; // 股票代码
  ann_date?: string; // 公告日期
  start_date?: string; // 公告开始日期
  end_date?: string; // 公告结束日期
  period?: string; // 报告期(每个季度最后一天的日期,比如20171231表示年报)
};
export type ExpressResult = {
  ts_code?: string; // TS股票代码
  ann_date?: string; // 公告日期
  end_date?: string; // 报告期
  revenue?: number; // 营业收入(元)
  operate_profit?: number; // 营业利润(元)
  total_profit?: number; // 利润总额(元)
  n_income?: number; // 净利润(元)
  total_assets?: number; // 总资产(元)
  total_hldr_eqy_exc_min_int?: number; // 股东权益合计(不含少数股东权益)(元)
  diluted_eps?: number; // 每股收益(摊薄)(元)
  diluted_roe?: number; // 净资产收益率(摊薄)(%)
  yoy_net_profit?: number; // 去年同期修正后净利润
  bps?: number; // 每股净资产
  yoy_sales?: number; // 同比增长率:营业收入
  yoy_op?: number; // 同比增长率:营业利润
  yoy_tp?: number; // 同比增长率:利润总额
  yoy_dedu_np?: number; // 同比增长率:归属母公司股东的净利润
  yoy_eps?: number; // 同比增长率:基本每股收益
  yoy_roe?: number; // 同比增减:加权平均净资产收益率
  growth_assets?: number; // 比年初增长率:总资产
  yoy_equity?: number; // 比年初增长率:归属母公司的股东权益
  growth_bps?: number; // 比年初增长率:归属于母公司股东的每股净资产
  or_last_year?: number; // 去年同期营业收入
  op_last_year?: number; // 去年同期营业利润
  tp_last_year?: number; // 去年同期利润总额
  np_last_year?: number; // 去年同期净利润
  eps_last_year?: number; // 去年同期每股收益
  open_net_assets?: number; // 期初净资产
  open_bps?: number; // 期初每股净资产
  perf_summary?: string; // 业绩简要说明
  is_audit?: number; // 是否审计： 1是 0否
  remark?: string; // 备注
};
export type ExpressField =
  | 'ts_code'
  | 'ann_date'
  | 'end_date'
  | 'revenue'
  | 'operate_profit'
  | 'total_profit'
  | 'n_income'
  | 'total_assets'
  | 'total_hldr_eqy_exc_min_int'
  | 'diluted_eps'
  | 'diluted_roe'
  | 'yoy_net_profit'
  | 'bps'
  | 'yoy_sales'
  | 'yoy_op'
  | 'yoy_tp'
  | 'yoy_dedu_np'
  | 'yoy_eps'
  | 'yoy_roe'
  | 'growth_assets'
  | 'yoy_equity'
  | 'growth_bps'
  | 'or_last_year'
  | 'op_last_year'
  | 'tp_last_year'
  | 'np_last_year'
  | 'eps_last_year'
  | 'open_net_assets'
  | 'open_bps'
  | 'perf_summary'
  | 'is_audit'
  | 'remark';

export const getExpress = async (
  token: string,
  params?: ExpressParams,
  fields?: ExpressField[] | string,
): Promise<ExpressResult[]> | null => {
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
  const data = await getExpress(tushare_token, {
    ts_code: '600132.SH',
  });
  console.log(data);
}

// test();
