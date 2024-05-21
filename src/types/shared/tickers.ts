import { Ticker } from 'ccxt';

import { TradekitError } from './errors';

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
