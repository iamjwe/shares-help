import axios from 'axios';
import { tushare_token } from '../../tushare.config';
/* 接口：cashflow
描述：获取上市公司现金流量表
*/
const api_name = 'cashflow';
export type CashflowParams = {
  ts_code: string; // 股票代码
  ann_date?: string; // 公告日期
  start_date?: string; // 公告开始日期
  end_date?: string; // 公告结束日期
  period?: string; // 报告期(每个季度最后一天的日期，比如20171231表示年报)
  report_type?: string; // 报告类型：见下方详细说明
  comp_type?: string; // 公司类型：1一般工商业 2银行 3保险 4证券
};
export type CashflowResult = {
  ts_code?: string; // TS股票代码
  ann_date?: string; // 公告日期
  f_ann_date?: string; // 实际公告日期
  end_date?: string; // 报告期
  comp_type?: string; // 公司类型
  report_type?: string; // 报表类型
  net_profit?: number; // 净利润
  finan_exp?: number; // 财务费用
  c_fr_sale_sg?: number; // 销售商品、提供劳务收到的现金
  recp_tax_rends?: number; // 收到的税费返还
  n_depos_incr_fi?: number; // 客户存款和同业存放款项净增加额
  n_incr_loans_cb?: number; // 向中央银行借款净增加额
  n_inc_borr_oth_fi?: number; // 向其他金融机构拆入资金净增加额
  prem_fr_orig_contr?: number; // 收到原保险合同保费取得的现金
  n_incr_insured_dep?: number; // 保户储金净增加额
  n_reinsur_prem?: number; // 收到再保业务现金净额
  n_incr_disp_tfa?: number; // 处置交易性金融资产净增加额
  ifc_cash_incr?: number; // 收取利息和手续费净增加额
  n_incr_disp_faas?: number; // 处置可供出售金融资产净增加额
  n_incr_loans_oth_bank?: number; // 拆入资金净增加额
  n_cap_incr_repur?: number; // 回购业务资金净增加额
  c_fr_oth_operate_a?: number; // 收到其他与经营活动有关的现金
  c_inf_fr_operate_a?: number; // 经营活动现金流入小计
  c_paid_goods_s?: number; // 购买商品、接受劳务支付的现金
  c_paid_to_for_empl?: number; // 支付给职工以及为职工支付的现金
  c_paid_for_taxes?: number; // 支付的各项税费
  n_incr_clt_loan_adv?: number; // 客户贷款及垫款净增加额
  n_incr_dep_cbob?: number; // 存放央行和同业款项净增加额
  c_pay_claims_orig_inco?: number; // 支付原保险合同赔付款项的现金
  pay_handling_chrg?: number; // 支付手续费的现金
  pay_comm_insur_plcy?: number; // 支付保单红利的现金
  oth_cash_pay_oper_act?: number; // 支付其他与经营活动有关的现金
  st_cash_out_act?: number; // 经营活动现金流出小计
  n_cashflow_act?: number; // 经营活动产生的现金流量净额
  oth_recp_ral_inv_act?: number; // 收到其他与投资活动有关的现金
  c_disp_withdrwl_invest?: number; // 收回投资收到的现金
  c_recp_return_invest?: number; // 取得投资收益收到的现金
  n_recp_disp_fiolta?: number; // 处置固定资产、无形资产和其他长期资产收回的现金净额
  n_recp_disp_sobu?: number; // 处置子公司及其他营业单位收到的现金净额
  stot_inflows_inv_act?: number; // 投资活动现金流入小计
  c_pay_acq_const_fiolta?: number; // 购建固定资产、无形资产和其他长期资产支付的现金
  c_paid_invest?: number; // 投资支付的现金
  n_disp_subs_oth_biz?: number; // 取得子公司及其他营业单位支付的现金净额
  oth_pay_ral_inv_act?: number; // 支付其他与投资活动有关的现金
  n_incr_pledge_loan?: number; // 质押贷款净增加额
  stot_out_inv_act?: number; // 投资活动现金流出小计
  n_cashflow_inv_act?: number; // 投资活动产生的现金流量净额
  c_recp_borrow?: number; // 取得借款收到的现金
  proc_issue_bonds?: number; // 发行债券收到的现金
  oth_cash_recp_ral_fnc_act?: number; // 收到其他与筹资活动有关的现金
  stot_cash_in_fnc_act?: number; // 筹资活动现金流入小计
  free_cashflow?: number; // 企业自由现金流量
  c_prepay_amt_borr?: number; // 偿还债务支付的现金
  c_pay_dist_dpcp_int_exp?: number; // 分配股利、利润或偿付利息支付的现金
  incl_dvd_profit_paid_sc_ms?: number; // 其中:子公司支付给少数股东的股利、利润
  oth_cashpay_ral_fnc_act?: number; // 支付其他与筹资活动有关的现金
  stot_cashout_fnc_act?: number; // 筹资活动现金流出小计
  n_cash_flows_fnc_act?: number; // 筹资活动产生的现金流量净额
  eff_fx_flu_cash?: number; // 汇率变动对现金的影响
  n_incr_cash_cash_equ?: number; // 现金及现金等价物净增加额
  c_cash_equ_beg_period?: number; // 期初现金及现金等价物余额
  c_cash_equ_end_period?: number; // 期末现金及现金等价物余额
  c_recp_cap_contrib?: number; // 吸收投资收到的现金
  incl_cash_rec_saims?: number; // 其中:子公司吸收少数股东投资收到的现金
  uncon_invest_loss?: number; // 未确认投资损失
  prov_depr_assets?: number; // 加:资产减值准备
  depr_fa_coga_dpba?: number; // 固定资产折旧、油气资产折耗、生产性生物资产折旧
  amort_intang_assets?: number; // 无形资产摊销
  lt_amort_deferred_exp?: number; // 长期待摊费用摊销
  decr_deferred_exp?: number; // 待摊费用减少
  incr_acc_exp?: number; // 预提费用增加
  loss_disp_fiolta?: number; // 处置固定、无形资产和其他长期资产的损失
  loss_scr_fa?: number; // 固定资产报废损失
  loss_fv_chg?: number; // 公允价值变动损失
  invest_loss?: number; // 投资损失
  decr_def_inc_tax_assets?: number; // 递延所得税资产减少
  incr_def_inc_tax_liab?: number; // 递延所得税负债增加
  decr_inventories?: number; // 存货的减少
  decr_oper_payable?: number; // 经营性应收项目的减少
  incr_oper_payable?: number; // 经营性应付项目的增加
  others?: number; // 其他
  im_net_cashflow_oper_act?: number; // 经营活动产生的现金流量净额(间接法)
  conv_debt_into_cap?: number; // 债务转为资本
  conv_copbonds_due_within_1y?: number; // 一年内到期的可转换公司债券
  fa_fnc_leases?: number; // 融资租入固定资产
  end_bal_cash?: number; // 现金的期末余额
  beg_bal_cash?: number; // 减:现金的期初余额
  end_bal_cash_equ?: number; // 加:现金等价物的期末余额
  beg_bal_cash_equ?: number; // 减:现金等价物的期初余额
  im_n_incr_cash_equ?: number; // 现金及现金等价物净增加额(间接法)
  update_flag?: string; // 更新标识
};
export type CashflowField =
  | 'ts_code'
  | 'ann_date'
  | 'f_ann_date'
  | 'end_date'
  | 'comp_type'
  | 'report_type'
  | 'net_profit'
  | 'finan_exp'
  | 'c_fr_sale_sg'
  | 'recp_tax_rends'
  | 'n_depos_incr_fi'
  | 'n_incr_loans_cb'
  | 'n_inc_borr_oth_fi'
  | 'prem_fr_orig_contr'
  | 'n_incr_insured_dep'
  | 'n_reinsur_prem'
  | 'n_incr_disp_tfa'
  | 'ifc_cash_incr'
  | 'n_incr_disp_faas'
  | 'n_incr_loans_oth_bank'
  | 'n_cap_incr_repur'
  | 'c_fr_oth_operate_a'
  | 'c_inf_fr_operate_a'
  | 'c_paid_goods_s'
  | 'c_paid_to_for_empl'
  | 'c_paid_for_taxes'
  | 'n_incr_clt_loan_adv'
  | 'n_incr_dep_cbob'
  | 'c_pay_claims_orig_inco'
  | 'pay_handling_chrg'
  | 'pay_comm_insur_plcy'
  | 'oth_cash_pay_oper_act'
  | 'st_cash_out_act'
  | 'n_cashflow_act'
  | 'oth_recp_ral_inv_act'
  | 'c_disp_withdrwl_invest'
  | 'c_recp_return_invest'
  | 'n_recp_disp_fiolta'
  | 'n_recp_disp_sobu'
  | 'stot_inflows_inv_act'
  | 'c_pay_acq_const_fiolta'
  | 'c_paid_invest'
  | 'n_disp_subs_oth_biz'
  | 'oth_pay_ral_inv_act'
  | 'n_incr_pledge_loan'
  | 'stot_out_inv_act'
  | 'n_cashflow_inv_act'
  | 'c_recp_borrow'
  | 'proc_issue_bonds'
  | 'oth_cash_recp_ral_fnc_act'
  | 'stot_cash_in_fnc_act'
  | 'free_cashflow'
  | 'c_prepay_amt_borr'
  | 'c_pay_dist_dpcp_int_exp'
  | 'incl_dvd_profit_paid_sc_ms'
  | 'oth_cashpay_ral_fnc_act'
  | 'stot_cashout_fnc_act'
  | 'n_cash_flows_fnc_act'
  | 'eff_fx_flu_cash'
  | 'n_incr_cash_cash_equ'
  | 'c_cash_equ_beg_period'
  | 'c_cash_equ_end_period'
  | 'c_recp_cap_contrib'
  | 'incl_cash_rec_saims'
  | 'uncon_invest_loss'
  | 'prov_depr_assets'
  | 'depr_fa_coga_dpba'
  | 'amort_intang_assets'
  | 'lt_amort_deferred_exp'
  | 'decr_deferred_exp'
  | 'incr_acc_exp'
  | 'loss_disp_fiolta'
  | 'loss_scr_fa'
  | 'loss_fv_chg'
  | 'invest_loss'
  | 'decr_def_inc_tax_assets'
  | 'incr_def_inc_tax_liab'
  | 'decr_inventories'
  | 'decr_oper_payable'
  | 'incr_oper_payable'
  | 'others'
  | 'im_net_cashflow_oper_act'
  | 'conv_debt_into_cap'
  | 'conv_copbonds_due_within_1y'
  | 'fa_fnc_leases'
  | 'end_bal_cash'
  | 'beg_bal_cash'
  | 'end_bal_cash_equ'
  | 'beg_bal_cash_equ'
  | 'im_n_incr_cash_equ'
  | 'update_flag';

export const getCashflow = async (
  token: string,
  params?: CashflowParams,
  fields?: CashflowField[] | string,
): Promise<CashflowResult[]> | null => {
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
  const data = await getCashflow(tushare_token, {
    ts_code: '600132.SH',
  });
  console.log(data);
}

// test();
