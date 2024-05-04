import { ProxyRotator } from '../../shared/proxy';
import { ReadOnlyStremClient } from '../../shared/websocket';
import { IOkxWebsocketResponse } from '../../types/okx';
import { ITradekitResult } from '../../types/shared/errors';
import {
  IGetPriceOptions,
  IGetPricesOptions,
  IGetTikerOptions,
  IGetTikersOptions,
  IPrice,
  ISubscribeToPriceOptions,
  ISubscribeToPricesOptions,
  ISubscribeToTikerOptions,
  ISubscribeToTikersOptions,
  ITicker,
} from '../../types/shared/tickers';
import { OkxMarketDataHttpHandler } from './http';
import { OkxMarketDataWebsocketHandler } from './websocket';

export class OkxMarketDataHandler {
  private httpHandler;
  private websocketHandler;

  constructor(private http: ProxyRotator) {
    this.httpHandler = new OkxMarketDataHttpHandler(http);
    this.websocketHandler = new OkxMarketDataWebsocketHandler();
  }

  public async getPrice(
    opts: IGetPriceOptions
  ): Promise<ITradekitResult<IPrice>> {
    return this.httpHandler.getPrice(opts);
  }

  public async getPrices(
    opts: IGetPricesOptions
  ): Promise<ITradekitResult<IPrice[]>> {
    return this.httpHandler.getPrices(opts);
  }

  public subscribeToPrice(
    opts: ISubscribeToPriceOptions
  ): ReadOnlyStremClient<IOkxWebsocketResponse, IPrice> {
    return this.websocketHandler.subscribeToPrice(opts);
  }

  public subscribeToPrices(
    opts: ISubscribeToPricesOptions
  ): ReadOnlyStremClient<IOkxWebsocketResponse, IPrice[]> {
    return this.websocketHandler.subscribeToPrices(opts);
  }

  public async getTicker(
    opts: IGetTikerOptions
  ): Promise<ITradekitResult<ITicker>> {
    return this.httpHandler.getTicker(opts);
  }

  public async getTickers(
    opts: IGetTikersOptions
  ): Promise<ITradekitResult<ITicker[]>> {
    return this.httpHandler.getTickers(opts);
  }

  public subscribeToTiker(
    opts: ISubscribeToTikerOptions
  ): ReadOnlyStremClient<IOkxWebsocketResponse, ITicker> {
    return this.websocketHandler.subscribeToTiker(opts);
  }

  public subscribeToTikers(
    opts: ISubscribeToTikersOptions
  ): ReadOnlyStremClient<IOkxWebsocketResponse, ITicker[]> {
    return this.websocketHandler.subscribeToTikers(opts);
  }
}
