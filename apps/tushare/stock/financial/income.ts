import axios from 'axios';
import { tushare_token } from '../../tushare.config';
// 接口：income，可以通过数据工具调试和查看数据。
// 描述：获取上市公司财务利润表数据
const api_name = 'income';
export type IncomeParams = {
  ts_code: string; // 股票代码
  ann_date?: string; // 公告日期
  start_date?: string; // 公告开始日期
  end_date?: string; // 公告结束日期
  period?: string; // 报告期(每个季度最后一天的日期，比如20171231表示年报)
  report_type?: string; // 报告类型： 参考下表说明
  comp_type?: string; // 公司类型：1一般工商业 2银行 3保险 4证券
};
export type IncomeResult = {
  ts_code?: string; // TS代码
  ann_date?: string; // 公告日期
  f_ann_date?: string; // 实际公告日期
  end_date?: string; // 报告期
  report_type?: string; // 报告类型 1合并报表 2单季合并 3调整单季合并表 4调整合并报表 5调整前合并报表 6母公司报表 7母公司单季表 8 母公司调整单季表 9母公司调整表 10母公司调整前报表 11调整前合并报表 12母公司调整前报表
  comp_type?: string; // 公司类型(1一般工商业2银行3保险4证券)
  basic_eps?: number; // 基本每股收益
  diluted_eps?: number; // 稀释每股收益
  total_revenue?: number; // 营业总收入
  revenue?: number; // 营业收入
  int_income?: number; // 利息收入
  prem_earned?: number; // 已赚保费
  comm_income?: number; // 手续费及佣金收入
  n_commis_income?: number; // 手续费及佣金净收入
  n_oth_income?: number; // 其他经营净收益
  n_oth_b_income?: number; // 加:其他业务净收益
  prem_income?: number; // 保险业务收入
  out_prem?: number; // 减:分出保费
  une_prem_reser?: number; // 提取未到期责任准备金
  reins_income?: number; // 其中:分保费收入
  n_sec_tb_income?: number; // 代理买卖证券业务净收入
  n_sec_uw_income?: number; // 证券承销业务净收入
  n_asset_mg_income?: number; // 受托客户资产管理业务净收入
  oth_b_income?: number; // 其他业务收入
  fv_value_chg_gain?: number; // 加:公允价值变动净收益
  invest_income?: number; // 加:投资净收益
  ass_invest_income?: number; // 其中:对联营企业和合营企业的投资收益
  forex_gain?: number; // 加:汇兑净收益
  total_cogs?: number; // 营业总成本
  oper_cost?: number; // 减:营业成本
  int_exp?: number; // 减:利息支出
  comm_exp?: number; // 减:手续费及佣金支出
  biz_tax_surchg?: number; // 减:营业税金及附加
  sell_exp?: number; // 减:销售费用
  admin_exp?: number; // 减:管理费用
  fin_exp?: number; // 减:财务费用
  assets_impair_loss?: number; // 减:资产减值损失
  prem_refund?: number; // 退保金
  compens_payout?: number; // 赔付总支出
  reser_insur_liab?: number; // 提取保险责任准备金
  div_payt?: number; // 保户红利支出
  reins_exp?: number; // 分保费用
  oper_exp?: number; // 营业支出
  compens_payout_refu?: number; // 减:摊回赔付支出
  insur_reser_refu?: number; // 减:摊回保险责任准备金
  reins_cost_refund?: number; // 减:摊回分保费用
  other_bus_cost?: number; // 其他业务成本
  operate_profit?: number; // 营业利润
  non_oper_income?: number; // 加:营业外收入
  non_oper_exp?: number; // 减:营业外支出
  nca_disploss?: number; // 其中:减:非流动资产处置净损失
  total_profit?: number; // 利润总额
  income_tax?: number; // 所得税费用
  n_income?: number; // 净利润(含少数股东损益)
  n_income_attr_p?: number; // 净利润(不含少数股东损益)
  minority_gain?: number; // 少数股东损益
  oth_compr_income?: number; // 其他综合收益
  t_compr_income?: number; // 综合收益总额
  compr_inc_attr_p?: number; // 归属于母公司(或股东)的综合收益总额
  compr_inc_attr_m_s?: number; // 归属于少数股东的综合收益总额
  ebit?: number; // 息税前利润
  ebitda?: number; // 息税折旧摊销前利润
  insurance_exp?: number; // 保险业务支出
  undist_profit?: number; // 年初未分配利润
  distable_profit?: number; // 可分配利润
  update_flag?: string; // 更新标识，0未修改1更正过
};
export type IncomeField =
  | 'ts_code'
  | 'ann_date'
  | 'f_ann_date'
  | 'end_date'
  | 'report_type'
  | 'comp_type'
  | 'basic_eps'
  | 'diluted_eps'
  | 'total_revenue'
  | 'revenue'
  | 'int_income'
  | 'prem_earned'
  | 'comm_income'
  | 'n_commis_income'
  | 'n_oth_income'
  | 'n_oth_b_income'
  | 'prem_income'
  | 'out_prem'
  | 'une_prem_reser'
  | 'reins_income'
  | 'n_sec_tb_income'
  | 'n_sec_uw_income'
  | 'n_asset_mg_income'
  | 'oth_b_income'
  | 'fv_value_chg_gain'
  | 'invest_income'
  | 'ass_invest_income'
  | 'forex_gain'
  | 'total_cogs'
  | 'oper_cost'
  | 'int_exp'
  | 'comm_exp'
  | 'biz_tax_surchg'
  | 'sell_exp'
  | 'admin_exp'
  | 'fin_exp'
  | 'assets_impair_loss'
  | 'prem_refund'
  | 'compens_payout'
  | 'reser_insur_liab'
  | 'div_payt'
  | 'reins_exp'
  | 'oper_exp'
  | 'compens_payout_refu'
  | 'insur_reser_refu'
  | 'reins_cost_refund'
  | 'other_bus_cost'
  | 'operate_profit'
  | 'non_oper_income'
  | 'non_oper_exp'
  | 'nca_disploss'
  | 'total_profit'
  | 'income_tax'
  | 'n_income'
  | 'n_income_attr_p'
  | 'minority_gain'
  | 'oth_compr_income'
  | 't_compr_income'
  | 'compr_inc_attr_p'
  | 'compr_inc_attr_m_s'
  | 'ebit'
  | 'ebitda'
  | 'insurance_exp'
  | 'undist_profit'
  | 'distable_profit'
  | 'update_flag';

export const getIncome = async (
  token: string,
  params?: IncomeParams,
  fields?: IncomeField[] | string,
): Promise<IncomeResult[]> | null => {
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
  const data = await getIncome(tushare_token, {
    ts_code: '600132.SH',
  });
  console.log(data[0], data.length);
}

// test();
