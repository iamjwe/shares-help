import axios from 'axios';
import { tushare_token } from '../../tushare.config';
/*
接口：stk_holdertrade
描述：获取上市公司增减持数据，了解重要股东近期及历史上的股份增减变化
限量：单次最大提取3000行记录，总量不限制
*/
const api_name = 'stk_holdertrade';
export type StkHoldertradeParams = {
  ts_code?: string; // TS股票代码
  ann_date?: string; // 公告日期
  start_date?: string; // 公告开始日期
  end_date?: string; // 公告结束日期
  trade_type?: string; // 交易类型IN增持DE减持
  holder_type?: string; // 股东类型C公司P个人G高管
};
export type StkHoldertradeResult = {
  ts_code?: string; // TS代码
  ann_date?: string; // 公告日期
  holder_name?: string; // 股东名称
  holder_type?: string; // 股东类型G高管P个人C公司
  in_de?: string; // 类型IN增持DE减持
  change_vol?: number; // 变动数量
  change_ratio?: number; // 占流通比例（%）
  after_share?: number; // 变动后持股
  after_ratio?: number; // 变动后占流通比例（%）
  avg_price?: number; // 平均价格
  total_share?: number; // 持股总数
  begin_date?: string; // 增减持开始日期
  close_date?: string; // 增减持结束日期
};
export type StkHoldertradeField =
  | 'ts_code'
  | 'ann_date'
  | 'holder_name'
  | 'holder_type'
  | 'in_de'
  | 'change_vol'
  | 'change_ratio'
  | 'after_share'
  | 'after_ratio'
  | 'avg_price'
  | 'total_share'
  | 'begin_date'
  | 'close_date';

export const getStkHoldertrade = async (
  token: string,
  params?: StkHoldertradeParams,
  fields?: StkHoldertradeField[] | string,
): Promise<StkHoldertradeResult[]> | null => {
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
  const data = await getStkHoldertrade(tushare_token, {
    ts_code: '600132.SH',
  });
  console.log(data);
}

// test();
