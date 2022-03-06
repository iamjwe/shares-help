import axios from 'axios';
import { tushare_token } from '../../tushare.config';
/*
接口：fina_audit
描述：获取上市公司定期财务审计意见数据
*/
const api_name = 'fina_audit';
export type FinaAuditParams = {
  ts_code: string; // 股票代码
  ann_date?: string; // 公告日期
  start_date?: string; // 公告开始日期
  end_date?: string; // 公告结束日期
  period?: string; // 报告期(每个季度最后一天的日期,比如20171231表示年报)
};
export type FinaAuditResult = {
  ts_code?: string; // TS股票代码
  ann_date?: string; // 公告日期
  end_date?: string; // 报告期
  audit_result?: string; // 审计结果
  audit_fees?: number; // 审计总费用（元）
  audit_agency?: string; // 会计事务所
  audit_sign?: string; // 签字会计师
};
export type FinaAuditField =
  | 'ts_code'
  | 'ann_date'
  | 'end_date'
  | 'audit_result'
  | 'audit_fees'
  | 'audit_agency'
  | 'audit_sign';

export const getFinaAudit = async (
  token: string,
  params?: FinaAuditParams,
  fields?: FinaAuditField[] | string,
): Promise<FinaAuditResult[]> | null => {
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
  const data = await getFinaAudit(tushare_token, {
    ts_code: '600132.SH',
  });
  console.log(data);
}

// test();
