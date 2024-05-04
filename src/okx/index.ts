import { TradeKit } from '../shared';
import { ReadOnlyStremClient } from '../shared/websocket';
import { IOkxWebsocketResponse } from '../types/okx';
import { ITradekitOptions } from '../types/shared';
import {
  IGetTikerOptions,
  ITicker,
  IGetTikersOptions,
  IGetPriceOptions,
  IPrice,
  IGetPricesOptions,
  ISubscribeToPriceOptions,
  ISubscribeToPricesOptions,
  ISubscribeToTikerOptions,
  ISubscribeToTikersOptions,
} from '../types/shared/tickers';
import { ITradekitResult } from '../types/shared/errors';
import { OkxMarketDataHandler } from './market-data';

export class Okx extends TradeKit {
  private marketDataHandler;

  constructor(opts: ITradekitOptions) {
    super(opts);
    const http = this.http.getBaseInstance();
    http.defaults.baseURL = 'https://www.okx.com/';
    this.http.replaceBaseInstance(http);

    this.marketDataHandler = new OkxMarketDataHandler(this.http);
  }

  public override async getTicker(
    opts: IGetTikerOptions
  ): Promise<ITradekitResult<ITicker>> {
    return this.marketDataHandler.getTicker(opts);
  }

  public override async getTickers(
    opts: IGetTikersOptions
  ): Promise<ITradekitResult<ITicker[]>> {
    return this.marketDataHandler.getTickers(opts);
  }

  public override async getPrice(
    opts: IGetPriceOptions
  ): Promise<ITradekitResult<IPrice>> {
    return this.marketDataHandler.getPrice(opts);
  }

  public override async getPrices(
    opts: IGetPricesOptions
  ): Promise<ITradekitResult<IPrice[]>> {
    return this.marketDataHandler.getPrices(opts);
  }

  public override subscribeToTiker(
    opts: ISubscribeToTikerOptions
  ): ReadOnlyStremClient<IOkxWebsocketResponse, ITicker> {
    return this.marketDataHandler.subscribeToTiker(opts);
  }

  public override subscribeToTikers(
    opts: ISubscribeToTikersOptions
  ): ReadOnlyStremClient<IOkxWebsocketResponse, ITicker[]> {
    return this.marketDataHandler.subscribeToTikers(opts);
  }

  public override subscribeToPrice(
    opts: ISubscribeToPriceOptions
  ): ReadOnlyStremClient<IOkxWebsocketResponse, IPrice> {
    return this.marketDataHandler.subscribeToPrice(opts);
  }

  public override subscribeToPrices(
    opts: ISubscribeToPricesOptions
  ): ReadOnlyStremClient<IOkxWebsocketResponse, IPrice[]> {
    return this.marketDataHandler.subscribeToPrices(opts);
  }
}
