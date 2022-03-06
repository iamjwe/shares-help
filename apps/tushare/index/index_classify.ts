import axios from 'axios';
import { tushare_token } from '../tushare.config';
/*
接口：index_classify
描述：获取申万行业分类，包括申万28个一级分类，104个二级分类，227个三级分类的列表信息
*/
const api_name = 'index_classify';
export type IndexClassifyParams = {
  index_code?: string; // 指数代码
  level?: string; // 行业分级（L1/L2/L3）
  src?: string; // 指数来源（SW申万）
};
export type IndexClassifyResult = {
  index_code?: string; // 指数代码
  industry_name?: string; // 行业名称
  level?: string; // 行业名称
  industry_code?: string; // 行业代码
  src?: string; // 行业分类（SW申万）
};
export type IndexClassifyField =
  | 'index_code'
  | 'industry_name'
  | 'level'
  | 'industry_code'
  | 'src';

export const getIndexClassify = async (
  token: string,
  params?: IndexClassifyParams,
  fields?: IndexClassifyField[] | string,
): Promise<IndexClassifyResult[]> | null => {
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
  const data = await getIndexClassify(tushare_token, {
    level: 'L2',
    src: 'SW',
  });
  console.log(data);
}

// test();
