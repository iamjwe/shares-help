import axios from 'axios';
import { tushare_token } from '../../tushare.config';
/*
接口：fina_indicator
描述：获取上市公司财务指标数据，为避免服务器压力，现阶段每次请求最多返回60条记录，可通过设置日期多次请求获取更多数据。
*/
const api_name = 'fina_indicator';
export type FinaIndicatorParams = {
  ts_code: string; // TS股票代码,e.g. 600001.SH/000001.SZ
  ann_date?: string; // 公告日期
  start_date?: string; // 报告期开始日期
  end_date?: string; // 报告期结束日期
  period?: string; // 报告期(每个季度最后一天的日期,比如20171231表示年报)
};
export type FinaIndicatorResult = {
  ts_code?: string; // TS代码
  ann_date?: string; // 公告日期
  end_date?: string; // 报告期
  eps?: number; // 基本每股收益
  dt_eps?: number; // 稀释每股收益
  total_revenue_ps?: number; // 每股营业总收入
  revenue_ps?: number; // 每股营业收入
  capital_rese_ps?: number; // 每股资本公积
  surplus_rese_ps?: number; // 每股盈余公积
  undist_profit_ps?: number; // 每股未分配利润
  extra_item?: number; // 非经常性损益
  profit_dedt?: number; // 扣除非经常性损益后的净利润
  gross_margin?: number; // 毛利
  current_ratio?: number; // 流动比率
  quick_ratio?: number; // 速动比率
  cash_ratio?: number; // 保守速动比率
  invturn_days?: number; // 存货周转天数
  arturn_days?: number; // 应收账款周转天数
  inv_turn?: number; // 存货周转率
  ar_turn?: number; // 应收账款周转率
  ca_turn?: number; // 流动资产周转率
  fa_turn?: number; // 固定资产周转率
  assets_turn?: number; // 总资产周转率
  op_income?: number; // 经营活动净收益
  valuechange_income?: number; // 价值变动净收益
  interst_income?: number; // 利息费用
  daa?: number; // 折旧与摊销
  ebit?: number; // 息税前利润
  ebitda?: number; // 息税折旧摊销前利润
  fcff?: number; // 企业自由现金流量
  fcfe?: number; // 股权自由现金流量
  current_exint?: number; // 无息流动负债
  noncurrent_exint?: number; // 无息非流动负债
  interestdebt?: number; // 带息债务
  netdebt?: number; // 净债务
  tangible_asset?: number; // 有形资产
  working_capital?: number; // 营运资金
  networking_capital?: number; // 营运流动资本
  invest_capital?: number; // 全部投入资本
  retained_earnings?: number; // 留存收益
  diluted2_eps?: number; // 期末摊薄每股收益
  bps?: number; // 每股净资产
  ocfps?: number; // 每股经营活动产生的现金流量净额
  retainedps?: number; // 每股留存收益
  cfps?: number; // 每股现金流量净额
  ebit_ps?: number; // 每股息税前利润
  fcff_ps?: number; // 每股企业自由现金流量
  fcfe_ps?: number; // 每股股东自由现金流量
  netprofit_margin?: number; // 销售净利率
  grossprofit_margin?: number; // 销售毛利率
  cogs_of_sales?: number; // 销售成本率
  expense_of_sales?: number; // 销售期间费用率
  profit_to_gr?: number; // 净利润/营业总收入
  saleexp_to_gr?: number; // 销售费用/营业总收入
  adminexp_of_gr?: number; // 管理费用/营业总收入
  finaexp_of_gr?: number; // 财务费用/营业总收入
  impai_ttm?: number; // 资产减值损失/营业总收入
  gc_of_gr?: number; // 营业总成本/营业总收入
  op_of_gr?: number; // 营业利润/营业总收入
  ebit_of_gr?: number; // 息税前利润/营业总收入
  roe?: number; // 净资产收益率
  roe_waa?: number; // 加权平均净资产收益率
  roe_dt?: number; // 净资产收益率(扣除非经常损益)
  roa?: number; // 总资产报酬率
  npta?: number; // 总资产净利润
  roic?: number; // 投入资本回报率
  roe_yearly?: number; // 年化净资产收益率
  roa2_yearly?: number; // 年化总资产报酬率
  roe_avg?: number; // 平均净资产收益率(增发条件)
  opincome_of_ebt?: number; // 经营活动净收益/利润总额
  investincome_of_ebt?: number; // 价值变动净收益/利润总额
  n_op_profit_of_ebt?: number; // 营业外收支净额/利润总额
  tax_to_ebt?: number; // 所得税/利润总额
  dtprofit_to_profit?: number; // 扣除非经常损益后的净利润/净利润
  salescash_to_or?: number; // 销售商品提供劳务收到的现金/营业收入
  ocf_to_or?: number; // 经营活动产生的现金流量净额/营业收入
  ocf_to_opincome?: number; // 经营活动产生的现金流量净额/经营活动净收益
  capitalized_to_da?: number; // 资本支出/折旧和摊销
  debt_to_assets?: number; // 资产负债率
  assets_to_eqt?: number; // 权益乘数
  dp_assets_to_eqt?: number; // 权益乘数(杜邦分析)
  ca_to_assets?: number; // 流动资产/总资产
  nca_to_assets?: number; // 非流动资产/总资产
  tbassets_to_totalassets?: number; // 有形资产/总资产
  int_to_talcap?: number; // 带息债务/全部投入资本
  eqt_to_talcapital?: number; // 归属于母公司的股东权益/全部投入资本
  currentdebt_to_debt?: number; // 流动负债/负债合计
  longdeb_to_debt?: number; // 非流动负债/负债合计
  ocf_to_shortdebt?: number; // 经营活动产生的现金流量净额/流动负债
  debt_to_eqt?: number; // 产权比率
  eqt_to_debt?: number; // 归属于母公司的股东权益/负债合计
  eqt_to_interestdebt?: number; // 归属于母公司的股东权益/带息债务
  tangibleasset_to_debt?: number; // 有形资产/负债合计
  tangasset_to_intdebt?: number; // 有形资产/带息债务
  tangibleasset_to_netdebt?: number; // 有形资产/净债务
  ocf_to_debt?: number; // 经营活动产生的现金流量净额/负债合计
  ocf_to_interestdebt?: number; // 经营活动产生的现金流量净额/带息债务
  ocf_to_netdebt?: number; // 经营活动产生的现金流量净额/净债务
  ebit_to_interest?: number; // 已获利息倍数(EBIT/利息费用)
  longdebt_to_workingcapital?: number; // 长期债务与营运资金比率
  ebitda_to_debt?: number; // 息税折旧摊销前利润/负债合计
  turn_days?: number; // 营业周期
  roa_yearly?: number; // 年化总资产净利率
  roa_dp?: number; // 总资产净利率(杜邦分析)
  fixed_assets?: number; // 固定资产合计
  profit_prefin_exp?: number; // 扣除财务费用前营业利润
  non_op_profit?: number; // 非营业利润
  op_to_ebt?: number; // 营业利润／利润总额
  nop_to_ebt?: number; // 非营业利润／利润总额
  ocf_to_profit?: number; // 经营活动产生的现金流量净额／营业利润
  cash_to_liqdebt?: number; // 货币资金／流动负债
  cash_to_liqdebt_withinterest?: number; // 货币资金／带息流动负债
  op_to_liqdebt?: number; // 营业利润／流动负债
  op_to_debt?: number; // 营业利润／负债合计
  roic_yearly?: number; // 年化投入资本回报率
  total_fa_trun?: number; // 固定资产合计周转率
  profit_to_op?: number; // 利润总额／营业收入
  q_opincome?: number; // 经营活动单季度净收益
  q_investincome?: number; // 价值变动单季度净收益
  q_dtprofit?: number; // 扣除非经常损益后的单季度净利润
  q_eps?: number; // 每股收益(单季度)
  q_netprofit_margin?: number; // 销售净利率(单季度)
  q_gsprofit_margin?: number; // 销售毛利率(单季度)
  q_exp_to_sales?: number; // 销售期间费用率(单季度)
  q_profit_to_gr?: number; // 净利润／营业总收入(单季度)
  q_saleexp_to_gr?: number; // 销售费用／营业总收入 (单季度)
  q_adminexp_to_gr?: number; // 管理费用／营业总收入 (单季度)
  q_finaexp_to_gr?: number; // 财务费用／营业总收入 (单季度)
  q_impair_to_gr_ttm?: number; // 资产减值损失／营业总收入(单季度)
  q_gc_to_gr?: number; // 营业总成本／营业总收入 (单季度)
  q_op_to_gr?: number; // 营业利润／营业总收入(单季度)
  q_roe?: number; // 净资产收益率(单季度)
  q_dt_roe?: number; // 净资产单季度收益率(扣除非经常损益)
  q_npta?: number; // 总资产净利润(单季度)
  q_opincome_to_ebt?: number; // 经营活动净收益／利润总额(单季度)
  q_investincome_to_ebt?: number; // 价值变动净收益／利润总额(单季度)
  q_dtprofit_to_profit?: number; // 扣除非经常损益后的净利润／净利润(单季度)
  q_salescash_to_or?: number; // 销售商品提供劳务收到的现金／营业收入(单季度)
  q_ocf_to_sales?: number; // 经营活动产生的现金流量净额／营业收入(单季度)
  q_ocf_to_or?: number; // 经营活动产生的现金流量净额／经营活动净收益(单季度)
  basic_eps_yoy?: number; // 基本每股收益同比增长率(%)
  dt_eps_yoy?: number; // 稀释每股收益同比增长率(%)
  cfps_yoy?: number; // 每股经营活动产生的现金流量净额同比增长率(%)
  op_yoy?: number; // 营业利润同比增长率(%)
  ebt_yoy?: number; // 利润总额同比增长率(%)
  netprofit_yoy?: number; // 归属母公司股东的净利润同比增长率(%)
  dt_netprofit_yoy?: number; // 归属母公司股东的净利润-扣除非经常损益同比增长率(%)
  ocf_yoy?: number; // 经营活动产生的现金流量净额同比增长率(%)
  roe_yoy?: number; // 净资产收益率(摊薄)同比增长率(%)
  bps_yoy?: number; // 每股净资产相对年初增长率(%)
  assets_yoy?: number; // 资产总计相对年初增长率(%)
  eqt_yoy?: number; // 归属母公司的股东权益相对年初增长率(%)
  tr_yoy?: number; // 营业总收入同比增长率(%)
  or_yoy?: number; // 营业收入同比增长率(%)
  q_gr_yoy?: number; // 营业总收入同比增长率(%)(单季度)
  q_gr_qoq?: number; // 营业总收入环比增长率(%)(单季度)
  q_sales_yoy?: number; // 营业收入同比增长率(%)(单季度)
  q_sales_qoq?: number; // 营业收入环比增长率(%)(单季度)
  q_op_yoy?: number; // 营业利润同比增长率(%)(单季度)
  q_op_qoq?: number; // 营业利润环比增长率(%)(单季度)
  q_profit_yoy?: number; // 净利润同比增长率(%)(单季度)
  q_profit_qoq?: number; // 净利润环比增长率(%)(单季度)
  q_netprofit_yoy?: number; // 归属母公司股东的净利润同比增长率(%)(单季度)
  q_netprofit_qoq?: number; // 归属母公司股东的净利润环比增长率(%)(单季度)
  equity_yoy?: number; // 净资产同比增长率
  rd_exp?: number; // 研发费用
  update_flag?: string; // 更新标识
};
export type FinaIndicatorField =
  | 'ts_code'
  | 'ann_date'
  | 'end_date'
  | 'eps'
  | 'dt_eps'
  | 'total_revenue_ps'
  | 'revenue_ps'
  | 'capital_rese_ps'
  | 'surplus_rese_ps'
  | 'undist_profit_ps'
  | 'extra_item'
  | 'profit_dedt'
  | 'gross_margin'
  | 'current_ratio'
  | 'quick_ratio'
  | 'cash_ratio'
  | 'invturn_days'
  | 'arturn_days'
  | 'inv_turn'
  | 'ar_turn'
  | 'ca_turn'
  | 'fa_turn'
  | 'assets_turn'
  | 'op_income'
  | 'valuechange_income'
  | 'interst_income'
  | 'daa'
  | 'ebit'
  | 'ebitda'
  | 'fcff'
  | 'fcfe'
  | 'current_exint'
  | 'noncurrent_exint'
  | 'interestdebt'
  | 'netdebt'
  | 'tangible_asset'
  | 'working_capital'
  | 'networking_capital'
  | 'invest_capital'
  | 'retained_earnings'
  | 'diluted2_eps'
  | 'bps'
  | 'ocfps'
  | 'retainedps'
  | 'cfps'
  | 'ebit_ps'
  | 'fcff_ps'
  | 'fcfe_ps'
  | 'netprofit_margin'
  | 'grossprofit_margin'
  | 'cogs_of_sales'
  | 'expense_of_sales'
  | 'profit_to_gr'
  | 'saleexp_to_gr'
  | 'adminexp_of_gr'
  | 'finaexp_of_gr'
  | 'impai_ttm'
  | 'gc_of_gr'
  | 'op_of_gr'
  | 'ebit_of_gr'
  | 'roe'
  | 'roe_waa'
  | 'roe_dt'
  | 'roa'
  | 'npta'
  | 'roic'
  | 'roe_yearly'
  | 'roa2_yearly'
  | 'roe_avg'
  | 'opincome_of_ebt'
  | 'investincome_of_ebt'
  | 'n_op_profit_of_ebt'
  | 'tax_to_ebt'
  | 'dtprofit_to_profit'
  | 'salescash_to_or'
  | 'ocf_to_or'
  | 'ocf_to_opincome'
  | 'capitalized_to_da'
  | 'debt_to_assets'
  | 'assets_to_eqt'
  | 'dp_assets_to_eqt'
  | 'ca_to_assets'
  | 'nca_to_assets'
  | 'tbassets_to_totalassets'
  | 'int_to_talcap'
  | 'eqt_to_talcapital'
  | 'currentdebt_to_debt'
  | 'longdeb_to_debt'
  | 'ocf_to_shortdebt'
  | 'debt_to_eqt'
  | 'eqt_to_debt'
  | 'eqt_to_interestdebt'
  | 'tangibleasset_to_debt'
  | 'tangasset_to_intdebt'
  | 'tangibleasset_to_netdebt'
  | 'ocf_to_debt'
  | 'ocf_to_interestdebt'
  | 'ocf_to_netdebt'
  | 'ebit_to_interest'
  | 'longdebt_to_workingcapital'
  | 'ebitda_to_debt'
  | 'turn_days'
  | 'roa_yearly'
  | 'roa_dp'
  | 'fixed_assets'
  | 'profit_prefin_exp'
  | 'non_op_profit'
  | 'op_to_ebt'
  | 'nop_to_ebt'
  | 'ocf_to_profit'
  | 'cash_to_liqdebt'
  | 'cash_to_liqdebt_withinterest'
  | 'op_to_liqdebt'
  | 'op_to_debt'
  | 'roic_yearly'
  | 'total_fa_trun'
  | 'profit_to_op'
  | 'q_opincome'
  | 'q_investincome'
  | 'q_dtprofit'
  | 'q_eps'
  | 'q_netprofit_margin'
  | 'q_gsprofit_margin'
  | 'q_exp_to_sales'
  | 'q_profit_to_gr'
  | 'q_saleexp_to_gr'
  | 'q_adminexp_to_gr'
  | 'q_finaexp_to_gr'
  | 'q_impair_to_gr_ttm'
  | 'q_gc_to_gr'
  | 'q_op_to_gr'
  | 'q_roe'
  | 'q_dt_roe'
  | 'q_npta'
  | 'q_opincome_to_ebt'
  | 'q_investincome_to_ebt'
  | 'q_dtprofit_to_profit'
  | 'q_salescash_to_or'
  | 'q_ocf_to_sales'
  | 'q_ocf_to_or'
  | 'basic_eps_yoy'
  | 'dt_eps_yoy'
  | 'cfps_yoy'
  | 'op_yoy'
  | 'ebt_yoy'
  | 'netprofit_yoy'
  | 'dt_netprofit_yoy'
  | 'ocf_yoy'
  | 'roe_yoy'
  | 'bps_yoy'
  | 'assets_yoy'
  | 'eqt_yoy'
  | 'tr_yoy'
  | 'or_yoy'
  | 'q_gr_yoy'
  | 'q_gr_qoq'
  | 'q_sales_yoy'
  | 'q_sales_qoq'
  | 'q_op_yoy'
  | 'q_op_qoq'
  | 'q_profit_yoy'
  | 'q_profit_qoq'
  | 'q_netprofit_yoy'
  | 'q_netprofit_qoq'
  | 'equity_yoy'
  | 'rd_exp'
  | 'update_flag';

export const getFinaIndicator = async (
  token: string,
  params?: FinaIndicatorParams,
  fields?: FinaIndicatorField[] | string,
): Promise<FinaIndicatorResult[]> | null => {
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
  const data = await getFinaIndicator(tushare_token, {
    ts_code: '600132.SH',
  });
  console.log(data);
}

// test();
