import axios from 'axios';
import { tushare_token } from '../../tushare.config';
/*
接口：concept_detail
描述：获取概念股分类明细数据
*/
const api_name = 'concept_detail';
export type ConceptDetailParams = {
  id?: string; // 概念分类ID （id来自概念股分类接口）
  ts_code?: string; // 股票代码  （以上参数二选一）
};
export type ConceptDetailResult = {
  id?: string; // 概念代码
  concept_name?: string; // 概念名称
  ts_code?: string; // 股票代码
  name?: string; // 股票名称
  in_date?: string; // 纳入日期
  out_date?: string; // 剔除日期
};
export type ConceptDetailField =
  | 'id'
  | 'concept_name'
  | 'ts_code'
  | 'name'
  | 'in_date'
  | 'out_date';

export const getConceptDetail = async (
  token: string,
  params?: ConceptDetailParams,
  fields?: ConceptDetailField[] | string,
): Promise<ConceptDetailResult[]> | null => {
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
  const data = await getConceptDetail(tushare_token, {
    ts_code: '600132.SH',
  });
  console.log(data);
}

// test();
