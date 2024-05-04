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
import { ITradekitResult } from '../types/shared/errors';
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

  public abstract getTicker(
    opts: IGetTikerOptions
  ): Promise<ITradekitResult<ITicker>>;
  public abstract subscribeToTiker(
    opts: ISubscribeToTikerOptions
  ): ReadOnlyStremClient<unknown, ITicker>;
  public abstract getTickers(
    opts: IGetTikersOptions
  ): Promise<ITradekitResult<ITicker[]>>;
  public abstract subscribeToTikers(
    opts: ISubscribeToTikersOptions
  ): ReadOnlyStremClient<unknown, ITicker[]>;

  public abstract getPrice(
    opts: IGetPriceOptions
  ): Promise<ITradekitResult<IPrice>>;
  public abstract subscribeToPrice(
    opts: ISubscribeToPriceOptions
  ): ReadOnlyStremClient<unknown, IPrice>;
  public abstract getPrices(
    opts: IGetPricesOptions
  ): Promise<ITradekitResult<IPrice[]>>;
  public abstract subscribeToPrices(
    opts: ISubscribeToPricesOptions
  ): ReadOnlyStremClient<unknown, IPrice[]>;

  // public abstract getBalance(
  //   opts?: IGetBalanceOptions
  // ): Promise<ITradekitResult<IGlobalBalance>>;
  // public abstract getMarginBalance(
  //   opts?: IGetBalanceOptions
  // ): Promise<ITradekitResult<IBalance>>;
  // public abstract getSpotBalance(
  //   opts?: IGetBalanceOptions
  // ): Promise<ITradekitResult<IBalance>>;

  // public abstract openShort(): Promise<ITradekitResult<boolean>>;
  // public abstract closeShort(): Promise<ITradekitResult<boolean>>;

  // public abstract openLong(): Promise<ITradekitResult<boolean>>;
  // public abstract closeLong(): Promise<ITradekitResult<boolean>>;

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
