import axios from 'axios';
import { tushare_token } from '../../tushare.config';
// 接口：stock_company
// 描述：获取上市公司基础信息，单次提取4500条，可以根据交易所分批提取
const api_name = 'stock_company';

export type StockCompanyParams = {
  ts_code?: string; // 	股票代码
  exchange?: string; // 交易所代码 ，SSE上交所 SZSE深交所
};

export type StockCompanyResult = {
  ts_code?: string; // 	股票代码
  exchange?: string; // 	交易所代码 ，SSE上交所 SZSE深交所
  chairman?: string; // 法人代表
  manager?: string; // 总经理
  secretary?: string; // 董秘
  reg_capital?: string; // 注册资本
  setup_date?: string; // 注册日期
  province?: string; // 所在省份
  city?: string; // 	所在城市
  introduction?: string; // 公司介绍
  website?: string; // 公司主页
  email?: string; // 	电子邮件
  office?: string; // 	办公室
  employees?: string; // 员工人数
  main_business?: string; // 	主要业务及产品
  business_scope?: string; // 	经营范围
};

export type StockBasicField =
  | 'ts_code'
  | 'exchange'
  | 'chairman'
  | 'manager'
  | 'secretary'
  | 'reg_capital'
  | 'setup_date'
  | 'province'
  | 'city'
  | 'introduction'
  | 'website'
  | 'email'
  | 'office'
  | 'employees'
  | 'main_business'
  | 'business_scope';

export const getStockCompany = async (
  token: string,
  params?: StockCompanyParams,
  fields?: StockBasicField[] | string,
): Promise<StockCompanyResult[]> | null => {
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
  const data = await getStockCompany(tushare_token, {
    ts_code: '600132.SH',
    // exchange: 'SSE',
  });
  console.log(data);
}

// test();
