import axios from 'axios';
import { tushare_token } from '../tushare.config';
/*
接口：fund_company
描述：获取公募基金管理人列表
*/
const api_name = 'fund_company';
export type FundCompanyParams = {};
export type FundCompanyResult = {
  name?: string; // 基金公司名称
  shortname?: string; // 简称
  short_enname?: string; // 英文缩写
  province?: string; // 省份
  city?: string; // 城市
  address?: string; // 注册地址
  phone?: string; // 电话
  office?: string; // 办公地址
  website?: string; // 公司网址
  chairman?: string; // 法人代表
  manager?: string; // 总经理
  reg_capital?: number; // 注册资本
  setup_date?: string; // 成立日期
  end_date?: string; // 公司终止日期
  employees?: number; // 员工总数
  main_business?: string; // 主要产品及业务
  org_code?: string; // 组织机构代码
  credit_code?: string; // 统一社会信用代码
};
export type FundCompanyField =
  | 'name'
  | 'shortname'
  | 'short_enname'
  | 'province'
  | 'city'
  | 'address'
  | 'phone'
  | 'office'
  | 'website'
  | 'chairman'
  | 'manager'
  | 'reg_capital'
  | 'setup_date'
  | 'end_date'
  | 'employees'
  | 'main_business'
  | 'org_code'
  | 'credit_code';

export const getFundCompany = async (
  token: string,
  params?: FundCompanyParams,
  fields?: FundCompanyField[] | string,
): Promise<FundCompanyResult[]> | null => {
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
  const data = await getFundCompany(tushare_token, {});
  console.log(data[0], data.length);
}

// test();
