export type BuyInfo = {
  [ts_code: string]: {
    buyDate: string;
    buyPercentage: number;
    buyPrice: number;
  };
};

export type SellInfo = {
  [ts_code: string]: {
    sellDate: string;
    sellPrice: number | null;
  };
};

export type HoldInfo = {
  [ts_code: string]: {
    holdDates: string[];
    holdDaysNum: number;
    holdProfit: number | null;
  };
};

export type OperateInfo = {
  buyInfo: BuyInfo;
  sellInfo: SellInfo;
  holdInfo: HoldInfo;
};
