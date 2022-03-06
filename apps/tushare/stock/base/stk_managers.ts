import axios from 'axios';
import { tushare_token } from '../../tushare.config';
// 接口：stk_managers
// 描述：获取上市公司管理层
const api_name = 'stk_managers';

export type StkManagersParams = {
  ts_code?: string; // 		股票代码，支持单个或多个股票输入
  ann_date?: string; // 	公告日期（YYYYMMDD格式，下同）
  start_date?: string; // 公告开始日期
  end_date?: string; // 公告结束日期
};

export type StkManagersResult = {
  ts_code?: string; // TS股票代码
  ann_date?: string; // 公告日期
  name?: string; // 姓名
  gender?: string; // 性别
  lev?: string; // 岗位类别
  title?: string; // 岗位
  edu?: string; // 学历
  national?: string; // 国籍
  birthday?: string; // 出生年月
  begin_date?: string; // 上任日期
  end_date?: string; // 离任日期
  resume?: string; // 	个人简历
};

export type StkManagersField =
  | 'ts_code'
  | 'ann_date'
  | 'name'
  | 'gender'
  | 'lev'
  | 'title'
  | 'edu'
  | 'national'
  | 'birthday'
  | 'begin_date'
  | 'end_date'
  | 'resume';

export const getStkManagers = async (
  token: string,
  params?: StkManagersParams,
  fields?: StkManagersField[] | string,
): Promise<StkManagersResult[]> | null => {
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
      console.log(fields, items);
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
  const data = await getStkManagers(tushare_token, {
    ts_code: '600132.SH',
  });
  console.log(data);
}

// test();
