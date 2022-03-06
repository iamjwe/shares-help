import axios from 'axios';
import { tushare_token } from '../../tushare.config';
// 接口：balancesheet
// 描述：获取上市公司资产负债表
const api_name = 'balancesheet';
export type BalancesheetParams = {
  ts_code: string; // 股票代码
  ann_date?: string; // 公告日期
  start_date?: string; // 公告开始日期
  end_date?: string; // 公告结束日期
  period?: string; // 报告期(每个季度最后一天的日期，比如20171231表示年报)
  report_type?: string; // 报告类型：见下方详细说明
  comp_type?: string; // 公司类型：1一般工商业 2银行 3保险 4证券
};
export type BalancesheetResult = {
  ts_code?: string; // TS股票代码
  ann_date?: string; // 公告日期
  f_ann_date?: string; // 实际公告日期
  end_date?: string; // 报告期
  report_type?: string; // 报表类型
  comp_type?: string; // 公司类型
  total_share?: number; // 期末总股本
  cap_rese?: number; // 资本公积金
  undistr_porfit?: number; // 未分配利润
  surplus_rese?: number; // 盈余公积金
  special_rese?: number; // 专项储备
  money_cap?: number; // 货币资金
  trad_asset?: number; // 交易性金融资产
  notes_receiv?: number; // 应收票据
  accounts_receiv?: number; // 应收账款
  oth_receiv?: number; // 其他应收款
  prepayment?: number; // 预付款项
  div_receiv?: number; // 应收股利
  int_receiv?: number; // 应收利息
  inventories?: number; // 存货
  amor_exp?: number; // 待摊费用
  nca_within_1y?: number; // 一年内到期的非流动资产
  sett_rsrv?: number; // 结算备付金
  loanto_oth_bank_fi?: number; // 拆出资金
  premium_receiv?: number; // 应收保费
  reinsur_receiv?: number; // 应收分保账款
  reinsur_res_receiv?: number; // 应收分保合同准备金
  pur_resale_fa?: number; // 买入返售金融资产
  oth_cur_assets?: number; // 其他流动资产
  total_cur_assets?: number; // 流动资产合计
  fa_avail_for_sale?: number; // 可供出售金融资产
  htm_invest?: number; // 持有至到期投资
  lt_eqt_invest?: number; // 长期股权投资
  invest_real_estate?: number; // 投资性房地产
  time_deposits?: number; // 定期存款
  oth_assets?: number; // 其他资产
  lt_rec?: number; // 长期应收款
  fix_assets?: number; // 固定资产
  cip?: number; // 在建工程
  const_materials?: number; // 工程物资
  fixed_assets_disp?: number; // 固定资产清理
  produc_bio_assets?: number; // 生产性生物资产
  oil_and_gas_assets?: number; // 油气资产
  intan_assets?: number; // 无形资产
  r_and_d?: number; // 研发支出
  goodwill?: number; // 商誉
  lt_amor_exp?: number; // 长期待摊费用
  defer_tax_assets?: number; // 递延所得税资产
  decr_in_disbur?: number; // 发放贷款及垫款
  oth_nca?: number; // 其他非流动资产
  total_nca?: number; // 非流动资产合计
  cash_reser_cb?: number; // 现金及存放中央银行款项
  depos_in_oth_bfi?: number; // 存放同业和其它金融机构款项
  prec_metals?: number; // 贵金属
  deriv_assets?: number; // 衍生金融资产
  rr_reins_une_prem?: number; // 应收分保未到期责任准备金
  rr_reins_outstd_cla?: number; // 应收分保未决赔款准备金
  rr_reins_lins_liab?: number; // 应收分保寿险责任准备金
  rr_reins_lthins_liab?: number; // 应收分保长期健康险责任准备金
  refund_depos?: number; // 存出保证金
  ph_pledge_loans?: number; // 保户质押贷款
  refund_cap_depos?: number; // 存出资本保证金
  indep_acct_assets?: number; // 独立账户资产
  client_depos?: number; // 其中：客户资金存款
  client_prov?: number; // 其中：客户备付金
  transac_seat_fee?: number; // 其中:交易席位费
  invest_as_receiv?: number; // 应收款项类投资
  total_assets?: number; // 资产总计
  lt_borr?: number; // 长期借款
  st_borr?: number; // 短期借款
  cb_borr?: number; // 向中央银行借款
  depos_ib_deposits?: number; // 吸收存款及同业存放
  loan_oth_bank?: number; // 拆入资金
  trading_fl?: number; // 交易性金融负债
  notes_payable?: number; // 应付票据
  acct_payable?: number; // 应付账款
  adv_receipts?: number; // 预收款项
  sold_for_repur_fa?: number; // 卖出回购金融资产款
  comm_payable?: number; // 应付手续费及佣金
  payroll_payable?: number; // 应付职工薪酬
  taxes_payable?: number; // 应交税费
  int_payable?: number; // 应付利息
  div_payable?: number; // 应付股利
  oth_payable?: number; // 其他应付款
  acc_exp?: number; // 预提费用
  deferred_inc?: number; // 递延收益
  st_bonds_payable?: number; // 应付短期债券
  payable_to_reinsurer?: number; // 应付分保账款
  rsrv_insur_cont?: number; // 保险合同准备金
  acting_trading_sec?: number; // 代理买卖证券款
  acting_uw_sec?: number; // 代理承销证券款
  non_cur_liab_due_1y?: number; // 一年内到期的非流动负债
  oth_cur_liab?: number; // 其他流动负债
  total_cur_liab?: number; // 流动负债合计
  bond_payable?: number; // 应付债券
  lt_payable?: number; // 长期应付款
  specific_payables?: number; // 专项应付款
  estimated_liab?: number; // 预计负债
  defer_tax_liab?: number; // 递延所得税负债
  defer_inc_non_cur_liab?: number; // 递延收益-非流动负债
  oth_ncl?: number; // 其他非流动负债
  total_ncl?: number; // 非流动负债合计
  depos_oth_bfi?: number; // 同业和其它金融机构存放款项
  deriv_liab?: number; // 衍生金融负债
  depos?: number; // 吸收存款
  agency_bus_liab?: number; // 代理业务负债
  oth_liab?: number; // 其他负债
  prem_receiv_adva?: number; // 预收保费
  depos_received?: number; // 存入保证金
  ph_invest?: number; // 保户储金及投资款
  reser_une_prem?: number; // 未到期责任准备金
  reser_outstd_claims?: number; // 未决赔款准备金
  reser_lins_liab?: number; // 寿险责任准备金
  reser_lthins_liab?: number; // 长期健康险责任准备金
  indept_acc_liab?: number; // 独立账户负债
  pledge_borr?: number; // 其中:质押借款
  indem_payable?: number; // 应付赔付款
  policy_div_payable?: number; // 应付保单红利
  total_liab?: number; // 负债合计
  treasury_share?: number; // 减:库存股
  ordin_risk_reser?: number; // 一般风险准备
  forex_differ?: number; // 外币报表折算差额
  invest_loss_unconf?: number; // 未确认的投资损失
  minority_int?: number; // 少数股东权益
  total_hldr_eqy_exc_min_int?: number; // 股东权益合计(不含少数股东权益)
  total_hldr_eqy_inc_min_int?: number; // 股东权益合计(含少数股东权益)
  total_liab_hldr_eqy?: number; // 负债及股东权益总计
  lt_payroll_payable?: number; // 长期应付职工薪酬
  oth_comp_income?: number; // 其他综合收益
  oth_eqt_tools?: number; // 其他权益工具
  oth_eqt_tools_p_shr?: number; // 其他权益工具(优先股)
  lending_funds?: number; // 融出资金
  acc_receivable?: number; // 应收款项
  st_fin_payable?: number; // 应付短期融资款
  payables?: number; // 应付款项
  hfs_assets?: number; // 持有待售的资产
  hfs_sales?: number; // 持有待售的负债
  update_flag?: string; // 更新标识
};
export type BalancesheetField =
  | 'ts_code'
  | 'ann_date'
  | 'f_ann_date'
  | 'end_date'
  | 'report_type'
  | 'comp_type'
  | 'total_share'
  | 'cap_rese'
  | 'undistr_porfit'
  | 'surplus_rese'
  | 'special_rese'
  | 'money_cap'
  | 'trad_asset'
  | 'notes_receiv'
  | 'accounts_receiv'
  | 'oth_receiv'
  | 'prepayment'
  | 'div_receiv'
  | 'int_receiv'
  | 'inventories'
  | 'amor_exp'
  | 'nca_within_1y'
  | 'sett_rsrv'
  | 'loanto_oth_bank_fi'
  | 'premium_receiv'
  | 'reinsur_receiv'
  | 'reinsur_res_receiv'
  | 'pur_resale_fa'
  | 'oth_cur_assets'
  | 'total_cur_assets'
  | 'fa_avail_for_sale'
  | 'htm_invest'
  | 'lt_eqt_invest'
  | 'invest_real_estate'
  | 'time_deposits'
  | 'oth_assets'
  | 'lt_rec'
  | 'fix_assets'
  | 'cip'
  | 'const_materials'
  | 'fixed_assets_disp'
  | 'produc_bio_assets'
  | 'oil_and_gas_assets'
  | 'intan_assets'
  | 'r_and_d'
  | 'goodwill'
  | 'lt_amor_exp'
  | 'defer_tax_assets'
  | 'decr_in_disbur'
  | 'oth_nca'
  | 'total_nca'
  | 'cash_reser_cb'
  | 'depos_in_oth_bfi'
  | 'prec_metals'
  | 'deriv_assets'
  | 'rr_reins_une_prem'
  | 'rr_reins_outstd_cla'
  | 'rr_reins_lins_liab'
  | 'rr_reins_lthins_liab'
  | 'refund_depos'
  | 'ph_pledge_loans'
  | 'refund_cap_depos'
  | 'indep_acct_assets'
  | 'client_depos'
  | 'client_prov'
  | 'transac_seat_fee'
  | 'invest_as_receiv'
  | 'total_assets'
  | 'lt_borr'
  | 'st_borr'
  | 'cb_borr'
  | 'depos_ib_deposits'
  | 'loan_oth_bank'
  | 'trading_fl'
  | 'notes_payable'
  | 'acct_payable'
  | 'adv_receipts'
  | 'sold_for_repur_fa'
  | 'comm_payable'
  | 'payroll_payable'
  | 'taxes_payable'
  | 'int_payable'
  | 'div_payable'
  | 'oth_payable'
  | 'acc_exp'
  | 'deferred_inc'
  | 'st_bonds_payable'
  | 'payable_to_reinsurer'
  | 'rsrv_insur_cont'
  | 'acting_trading_sec'
  | 'acting_uw_sec'
  | 'non_cur_liab_due_1y'
  | 'oth_cur_liab'
  | 'total_cur_liab'
  | 'bond_payable'
  | 'lt_payable'
  | 'specific_payables'
  | 'estimated_liab'
  | 'defer_tax_liab'
  | 'defer_inc_non_cur_liab'
  | 'oth_ncl'
  | 'total_ncl'
  | 'depos_oth_bfi'
  | 'deriv_liab'
  | 'depos'
  | 'agency_bus_liab'
  | 'oth_liab'
  | 'prem_receiv_adva'
  | 'depos_received'
  | 'ph_invest'
  | 'reser_une_prem'
  | 'reser_outstd_claims'
  | 'reser_lins_liab'
  | 'reser_lthins_liab'
  | 'indept_acc_liab'
  | 'pledge_borr'
  | 'indem_payable'
  | 'policy_div_payable'
  | 'total_liab'
  | 'treasury_share'
  | 'ordin_risk_reser'
  | 'forex_differ'
  | 'invest_loss_unconf'
  | 'minority_int'
  | 'total_hldr_eqy_exc_min_int'
  | 'total_hldr_eqy_inc_min_int'
  | 'total_liab_hldr_eqy'
  | 'lt_payroll_payable'
  | 'oth_comp_income'
  | 'oth_eqt_tools'
  | 'oth_eqt_tools_p_shr'
  | 'lending_funds'
  | 'acc_receivable'
  | 'st_fin_payable'
  | 'payables'
  | 'hfs_assets'
  | 'hfs_sales'
  | 'update_flag';

export const getBalancesheet = async (
  token: string,
  params?: BalancesheetParams,
  fields?: BalancesheetField[] | string,
): Promise<BalancesheetResult[]> | null => {
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
  const data = await getBalancesheet(tushare_token, {
    ts_code: '600132.SH',
  });
  console.log(data[0], data.length);
}

// test();
