import { ProxyRotator } from './proxy';
import { IProxyOptions } from '../types/shared/proxy';
import { ITradekitOptions } from '../types/shared';
import {
  IGetTikerOptions,
  ITicker,
  IGetTikersOptions,
  IPrice,
  IGetPriceOptions,
  IGetPricesOptions,
  ISubscribeToPriceOptions,
  ISubscribeToPricesOptions,
  ISubscribeToTikerOptions,
  ISubscribeToTikersOptions,
} from '../types/shared/tickers';
import {
  IBalance,
  IGetBalanceOptions,
  IGlobalBalance,
} from '../types/shared/balance';
import { ReadOnlyStremClient } from './websocket';

export abstract class TradeKit {
  protected http: ProxyRotator;

  constructor({ proxies }: ITradekitOptions) {
    this.http = new ProxyRotator({ proxies });
  }

  public abstract getTicker(opts: IGetTikerOptions): Promise<ITicker>;
  public abstract subscribeToTiker(
    opts: ISubscribeToTikerOptions
  ): ReadOnlyStremClient<unknown, ITicker>;
  public abstract getTickers(opts: IGetTikersOptions): Promise<ITicker[]>;
  public abstract subscribeToTikers(
    opts: ISubscribeToTikersOptions
  ): ReadOnlyStremClient<unknown, ITicker[]>;

  public abstract getPrice(opts: IGetPriceOptions): Promise<IPrice>;
  public abstract subscribeToPrice(
    opts: ISubscribeToPriceOptions
  ): ReadOnlyStremClient<unknown, IPrice>;
  public abstract getPrices(opts: IGetPricesOptions): Promise<IPrice[]>;
  public abstract subscribeToPrices(
    opts: ISubscribeToPricesOptions
  ): ReadOnlyStremClient<unknown, IPrice[]>;

  public abstract getBalance(
    opts?: IGetBalanceOptions
  ): Promise<IGlobalBalance>;
  public abstract getMarginBalance(
    opts?: IGetBalanceOptions
  ): Promise<IBalance>;
  public abstract getSpotBalance(opts?: IGetBalanceOptions): Promise<IBalance>;

  public abstract openShort(): Promise<boolean>;
  public abstract closeShort(): Promise<boolean>;

  public abstract openLong(): Promise<boolean>;
  public abstract closeLong(): Promise<boolean>;

  public setProxy(proxy: IProxyOptions | IProxyOptions[]): void {
    if (Array.isArray(proxy)) {
      this.http.setProxies(proxy);
      return;
    }
    this.http.setProxies([proxy]);
  }

  public getProxies(): IProxyOptions[] {
    return this.http.getProxies();
  }
  public getProxy(): IProxyOptions | undefined {
    return this.http.getCurrentProxy();
  }
}
