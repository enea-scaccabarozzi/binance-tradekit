import { ProxyRotator } from './proxy';
import { IProxyOptions } from '../types/proxy';
import { ITradekitOptions } from '../types/public';
import {
  IGetTikerOptions,
  ITicker,
  IGetTikersOptions,
  IPrice,
  IGetPriceOptions,
  IGetPricesOptions,
  ISubscribeToPriceOptions,
} from '../types/tickers';

export abstract class TradeKit {
  protected http: ProxyRotator;

  constructor({ proxies }: ITradekitOptions) {
    this.http = new ProxyRotator({ proxies });
  }

  abstract getTicker(opts: IGetTikerOptions): Promise<ITicker>;
  abstract getTickers(opts: IGetTikersOptions): Promise<ITicker[]>;

  abstract getPrice(opts: IGetPriceOptions): Promise<IPrice>;
  abstract getPrices(opts: IGetPricesOptions): Promise<IPrice[]>;
  abstract subscribeToPrice(opts: ISubscribeToPriceOptions): void;

  abstract getBalance(): Promise<number>;

  abstract openShortPosition(): Promise<void>;
  abstract closeShortPosition(): Promise<void>;

  abstract openLongPosition(): Promise<void>;
  abstract closeLongPosition(): Promise<void>;

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
