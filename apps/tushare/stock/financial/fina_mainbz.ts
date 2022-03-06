import axios from 'axios';
import { tushare_token } from '../../tushare.config';
/*
接口：fina_mainbz
描述：获得上市公司主营业务构成，分地区和产品两种方式
*/
const api_name = 'fina_mainbz';
export type FinaMainbzParams = {
  ts_code: string; // 股票代码
  period?: string; // 报告期(每个季度最后一天的日期,比如20171231表示年报)
  type?: string; // 类型：P按产品 D按地区（请输入大写字母P或者D）
  start_date?: string; // 报告期开始日期
  end_date?: string; // 报告期结束日期
};
export type FinaMainbzResult = {
  ts_code?: string; // TS代码
  end_date?: string; // 报告期
  bz_item?: string; // 主营业务来源
  bz_sales?: number; // 主营业务收入(元)
  bz_profit?: number; // 主营业务利润(元)
  bz_cost?: number; // 主营业务成本(元)
  curr_type?: string; // 货币代码
  update_flag?: string; // 是否更新
};
export type FinaMainbzField =
  | 'ts_code'
  | 'end_date'
  | 'bz_item'
  | 'bz_sales'
  | 'bz_profit'
  | 'bz_cost'
  | 'curr_type'
  | 'update_flag';

export const getFinaMainbz = async (
  token: string,
  params?: FinaMainbzParams,
  fields?: FinaMainbzField[] | string,
): Promise<FinaMainbzResult[]> | null => {
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
  const data = await getFinaMainbz(tushare_token, {
    ts_code: '600132.SH',
  });
  console.log(data);
}

// test();
