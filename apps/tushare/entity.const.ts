import TradeCal from '@/tushare/stock/base/trade_cal.entity';
import FundAdj from '@/tushare/fund/fund_adj.entity';
import FundBasic from '@/tushare/fund/fund_basic.entity';
import FundDaily from '@/tushare/fund/fund_daily.entity';
import IndexBasic from '@/tushare/index/index_basic.entity';
import IndexDaily from '@/tushare/index/index_daily.entity';
import IndexWeekly from '@/tushare/index/index_weekly.entity';
import IndexMonthly from '@/tushare/index/index_monthly.entity';
import ThsDaily from '@/tushare/index/ths_daily.entity';
import ThsIndex from '@/tushare/index/ths_index.entity';
import ThsMember from '@/tushare/index/ths_member.entity';
import StockBasic from '@/tushare/stock/base/stock_basic.entity';
import AdjFactor from '@/tushare/stock/quotes/adj_factor.entity';
import DailyBasic from '@/tushare/stock/quotes/daily_basic.entity';
import Daily from '@/tushare/stock/quotes/daily.entity';
import Weekly from '@/tushare/stock/quotes/weekly.entity';
import Monthly from '@/tushare/stock/quotes/monthly.entity';

// 下面这个数组声明了数据库会创建哪些表结构（存储到自己的数据库，用于解决tushare对数据访问次数的限制）
export const entities = [
  TradeCal,
  FundAdj,
  FundBasic,
  FundDaily,
  IndexBasic,
  IndexDaily,
  IndexWeekly,
  IndexMonthly,
  ThsDaily,
  ThsIndex,
  ThsMember,
  StockBasic,
  TradeCal,
  AdjFactor,
  DailyBasic,
  Daily,
  Weekly,
  Monthly,
];
