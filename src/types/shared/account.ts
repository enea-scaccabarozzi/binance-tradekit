export interface CurrencyBalance {
  free: number;
  used: number;
  total: number;
}

export interface Balance {
  currencies: { [currency: string]: CurrencyBalance };
  timestamp: number;
  datetime: Date;
}

export interface GetBalanceOptions {
  currencies?: string[];
}

export interface SetLeverageOptions {
  leverage: number;
  symbol?: string;
}
