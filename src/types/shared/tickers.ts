import { Ticker } from 'ccxt';

import { TradekitError } from './errors';

export interface BaseSubscriptionOptions<T> {
  onUpdate: (data: T) => void | Promise<void>;
  onConnect?: () => void | Promise<void>;
  onClose?: () => void | Promise<void>;
  onSubscribed?: () => void | Promise<void>;
  onError?: (error: TradekitError) => void | Promise<void>;
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
  BaseSubscriptionOptions<Ticker[]>;
