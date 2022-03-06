import axios from 'axios';
import { tushare_token } from '../../tushare.config';
// 接口：namechange
// 描述：历史名称变更记录
const api_name = 'namechange';

export type NameChangeParams = {
  ts_code: string; // 	TS代码
  start_date?: string; // 公告开始日期
  end_date?: string; // 公告结束日期
};

export type NameChangeResult = {
  ts_code?: string; // TS代码
  name?: string; // 证券名称
  start_date?: string; // 开始日期
  end_date?: string; // 结束日期
  ann_date?: string; // 公告日期
  change_reason?: string; // 	变更原因
};

export type NameChangeField =
  | 'ts_code'
  | 'name'
  | 'start_date'
  | 'end_date'
  | 'ann_date'
  | 'change_reason';

export const getNameChange = async (
  token: string,
  params?: NameChangeParams,
  fields?: NameChangeField[] | string,
): Promise<NameChangeResult[]> | null => {
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
  const data = await getNameChange(tushare_token, {
    ts_code: '600132.SH',
  });
  console.log(data);
}

// test();
