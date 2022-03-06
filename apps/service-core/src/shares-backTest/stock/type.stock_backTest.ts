export type OperateResult = {
  percentage: number;
  date_buy: string;
  date_sell: string;
  price_buy: number;
  price_sell: number;
  profit_hold: number;
} | null;

export type BackTestOneDayResult = {
  [ts_code: string]: OperateResult;
};

export type BackTestDateRangeResult = {
  [date: string]: BackTestOneDayResult;
};
