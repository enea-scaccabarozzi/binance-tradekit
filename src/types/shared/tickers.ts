import { TradekitError } from './errors';

export interface Ticker {
  symbol: string;
  timestamp: number;
  datetime: Date;
  last: number;
  close: number;
  absChange: number;
  percChange: number;
  high: number;
  low: number;
  volume: number;
  baseVolume: number;
  quoteVolume: number;
  open: number;
  openTime: Date;
  info: any;
}
export interface BaseSubscriptionOptions<T> {
  onUpdate: (data: T) => void;
  onClose?: () => void;
  onSubscription?: () => void;
  onError?: (error: TradekitError) => void;
}

export interface GetTikerOptions {
  symbol: string;
}
export type SubscribeToTikerOptions = GetTikerOptions &
  BaseSubscriptionOptions<Ticker>;

export interface GetTikersOptions {
  symbols: string[];
}
export type SubscribeToTikersOptions = GetTikersOptions &
  BaseSubscriptionOptions<Ticker>;
