export interface IBalance {
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
}

export interface IGlobalBalance extends IBalance {
  margin: IBalance;
  spot: IBalance;
}

export interface IGetBalanceOptions {
  symbols?: string[];
}
