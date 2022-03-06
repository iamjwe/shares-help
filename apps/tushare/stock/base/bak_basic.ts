import axios from 'axios';
import { tushare_token } from '../../tushare.config';
// 接口：bak_basic
// 描述：获取备用基础列表
const api_name = 'bak_basic';

export type BakBasicParams = {
  trade_date?: string; // 交易日期
  ts_code?: string; // 股票代码
};

export type BakBasicResult = {
  trade_date?: string; // 交易日期
  ts_code?: string; // 	TS股票代码
  name?: string; // 股票名称
  industry?: string; // 	行业
  area?: string; // 地域
  pe?: number; // 市盈率（动）
  float_share?: number; // 流通股本（万）
  total_share?: number; // 总股本（万）
  total_assets?: number; // 总资产（万）
  liquid_assets?: number; // 流动资产（万）
  fixed_assets?: number; // 固定资产（万）
  reserved?: number; // 	公积金
  reserved_pershare?: number; // 每股公积金
  eps?: number; // 每股收益
  bvps?: number; // 每股净资产
  pb?: number; // 	市净率
  list_date?: string; // 上市日期
  undp?: number; // 未分配利润
  per_undp?: number; // 每股未分配利润
  rev_yoy?: number; // 收入同比（%）
  profit_yoy?: number; // 	利润同比（%）
  gpr?: number; // 毛利率（%）
  npr?: number; // 净利润率（%）
  holder_num?: number; // 股东人数
};

export type HsConstField =
  | 'trade_date'
  | 'ts_code'
  | 'name'
  | 'industry'
  | 'area'
  | 'pe'
  | 'float_share'
  | 'total_share'
  | 'total_assets'
  | 'liquid_assets'
  | 'fixed_assets'
  | 'reserved'
  | 'reserved_pershare'
  | 'eps'
  | 'bvps'
  | 'pb'
  | 'list_date'
  | 'undp'
  | 'per_undp'
  | 'rev_yoy'
  | 'profit_yoy'
  | 'gpr'
  | 'npr'
  | 'holder_num';

export const getBakBasic = async (
  token: string,
  params?: BakBasicParams,
  fields?: HsConstField[] | string,
): Promise<BakBasicResult[]> | null => {
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
  const data = await getBakBasic(tushare_token, {
    trade_date: '20211008',
    ts_code: '600132.SH',
  });
  console.log(data);
}

// test();
