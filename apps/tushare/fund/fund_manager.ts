import axios from 'axios';
import { tushare_token } from '../tushare.config';
/*
接口：fund_manager
描述：获取公募基金经理数据，包括基金经理简历等数据
限量：单次最大5000，支持分页提取数据
*/
const api_name = 'fund_manager';
export type FundManagerParams = {
  ts_code?: string; // 基金代码，支持多只基金，逗号分隔
  ann_date?: string; // 公告日期，格式：YYYYMMDD
  name?: string; // 基金经理姓名
  offset?: number; // 开始行数
  limit?: number; // 每页行数
};
export type FundManagerResult = {
  ts_code?: string; // 基金代码
  ann_date?: string; // 公告日期
  name?: string; // 基金经理姓名
  gender?: string; // 性别
  birth_year?: string; // 出生年份
  edu?: string; // 学历
  nationality?: string; // 国籍
  begin_date?: string; // 任职日期
  end_date?: string; // 离任日期
  resume?: string; // 简历
};
export type FundManagerField =
  | 'ts_code'
  | 'ann_date'
  | 'name'
  | 'gender'
  | 'birth_year'
  | 'edu'
  | 'nationality'
  | 'begin_date'
  | 'end_date'
  | 'resume';

export const getFundManager = async (
  token: string,
  params?: FundManagerParams,
  fields?: FundManagerField[] | string,
): Promise<FundManagerResult[]> | null => {
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
  const data = await getFundManager(tushare_token, {
    ts_code: '150018.SZ',
  });
  console.log(data);
}

// test();
