export interface ITicker {
  symbol: string;
  datetime: Date;
  high: number;
  low: number;
  bid: ITickerOrder;
  ask: ITickerOrder;
  open: {
    price: number;
    datetime: Date;
  };
  last: number;
  timeframe: ITimeframe;
}

export interface IPrice {
  symbol: string;
  datetime: Date;
  price: number;
}

export interface IGetTikerOptions {
  symbol: string;
  timeframe?: ITimeframe;
}
export type IGetPriceOptions = IGetTikerOptions;
export interface ISubscribeToPriceOptions {
  cb: (price: IPrice) => void;
}

export interface IGetTikersOptions {
  symbols: string[];
  timeframe?: ITimeframe;
}
export type IGetPricesOptions = IGetTikersOptions;

export type ITimeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d';
export interface ITickerOrder {
  price: number;
  volume: number;
}
