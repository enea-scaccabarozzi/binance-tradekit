import { Balances, Order, Ticker } from 'ccxt';

import { ProxyOptions } from './proxy';
import { TradekitResult } from './errors';
import {
  GetTikerOptions,
  GetTikersOptions,
  SubscribeToTikerOptions,
  SubscribeToTikersOptions,
} from './tickers';
import { GetBalanceOptions, SetLeverageOptions } from './account';
import { ClosePositionOptions, OpenPositionOptions } from './orders';
import { StreamClient } from './websocket';

export interface TradekitOptions {
  proxies?: ProxyOptions[];
  sandbox?: boolean;
  auth?: TradekitAuth;
}

export interface TradekitAuth {
  key: string;
  secret: string;
  passphrase?: string;
}

export interface Tradekit {
  /* Proxy Management */
  addProxy(proxy: ProxyOptions): ProxyOptions;
  setProxies(proxies: ProxyOptions[]): number;
  getProxies(): TradekitResult<ProxyOptions[]>;
  getCurrentProxy(): TradekitResult<ProxyOptions>;
  rotateProxy(): TradekitResult<ProxyOptions>;

  /* Auth */
  setAuth(auth: TradekitAuth): boolean;
  getAuth(): TradekitResult<TradekitAuth>;

  /* Sandbox */
  setSandbox(sandbox: boolean): boolean;

  /* Market Data */
  getTicker(opts: GetTikerOptions): Promise<TradekitResult<Ticker>>;
  getTickers(opts: GetTikersOptions): Promise<TradekitResult<Ticker[]>>;
  subscribeToTicker(opts: SubscribeToTikerOptions): StreamClient;
  subscribeToTickers(opts: SubscribeToTikersOptions): StreamClient;

  /* Account Data */
  getBalance(opts?: GetBalanceOptions): Promise<TradekitResult<Balances>>;
  setLeverage(opts: SetLeverageOptions): Promise<TradekitResult<number>>;

  /* Position Management */
  openShort(opts: OpenPositionOptions): Promise<TradekitResult<Order>>;
  closeShort(opts: ClosePositionOptions): Promise<TradekitResult<Order>>;
  openLong(opts: OpenPositionOptions): Promise<TradekitResult<Order>>;
  closeLong(opts: ClosePositionOptions): Promise<TradekitResult<Order>>;
}
