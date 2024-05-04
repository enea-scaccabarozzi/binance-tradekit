export type IBalance = {
  datetime: Date;
  free: {
    [symbol: string]: number;
  };
  used: {
    [symbol: string]: number;
  };
  total: {
    [symbol: string]: number;
  };
} & {
  [currency: string]: {
    free: number;
    used: number;
    total: number;
  };
};

export type IGlobalBalance = IBalance & {
  margin: IBalance;
  spot: IBalance;
};

export interface IGetBalanceOptions {
  symbols?: string[];
}
