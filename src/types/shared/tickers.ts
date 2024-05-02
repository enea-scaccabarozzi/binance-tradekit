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

interface IBaseSubscriptionOptions<T> {
  cb: (data: T) => void | Promise<void>;
  onConnect?: () => void | Promise<void>;
  onClose?: () => void | Promise<void>;
}

export interface IGetTikerOptions {
  symbol: string;
  timeframe?: ITimeframe;
}
export type ISubscribeToTikerOptions = IGetTikerOptions &
  IBaseSubscriptionOptions<ITicker>;

export interface IGetTikersOptions {
  symbols: string[];
  timeframe?: ITimeframe;
}
export type ISubscribeToTikersOptions = IGetTikersOptions &
  IBaseSubscriptionOptions<ITicker[]>;

export type IGetPriceOptions = Omit<IGetTikerOptions, 'timeframe'>;
export type ISubscribeToPriceOptions = IGetPriceOptions &
  IBaseSubscriptionOptions<IPrice>;

export type IGetPricesOptions = Omit<IGetTikersOptions, 'timeframe'>;
export type ISubscribeToPricesOptions = IGetPricesOptions &
  IBaseSubscriptionOptions<IPrice[]>;

export type ITimeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d';
export interface ITickerOrder {
  price: number;
  volume: number;
}
