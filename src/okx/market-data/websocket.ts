import { ReadOnlyStremClient } from '../../shared/websocket';
import {
  IOkxWebsocketResponse,
  IOkxWebocketPushResponse,
} from '../../types/okx';
import {
  IBaseSubscriptionOptions,
  IPrice,
  ISubscribeToPriceOptions,
  ISubscribeToPricesOptions,
  ISubscribeToTikerOptions,
  ISubscribeToTikersOptions,
  ITicker,
} from '../../types/shared/tickers';
import { priceAdapter, tickerAdapter } from './adapters';

export class OkxMarketDataWebsocketHandler {
  private host = 'wss://ws.okx.com:8443/ws/v5/public';

  public subscribeToPrice(
    opts: ISubscribeToPriceOptions
  ): ReadOnlyStremClient<IOkxWebsocketResponse, IPrice> {
    const client = this.createClient(
      {
        ...opts,
        onConnect: () => {
          const instId = opts.symbol.replace('/', '-');
          const subscribePayload = this.buildSubscribePayload([instId]);
          client.send(subscribePayload);
          opts.onConnect?.();
        },
      },
      data => priceAdapter(data.data[0])
    );

    return client;
  }

  public subscribeToPrices(
    opts: ISubscribeToPricesOptions
  ): ReadOnlyStremClient<IOkxWebsocketResponse, IPrice[]> {
    const client = this.createClient(
      {
        ...opts,
        onConnect: () => {
          const instIds = opts.symbols.map(s => s.replace('/', '-'));
          const subscribePayload = this.buildSubscribePayload(instIds);
          client.send(subscribePayload);
          opts.onConnect?.();
        },
      },
      data => data.data.map(d => priceAdapter(d))
    );

    return client;
  }

  public subscribeToTiker(
    opts: ISubscribeToTikerOptions
  ): ReadOnlyStremClient<IOkxWebsocketResponse, ITicker> {
    const client = this.createClient(
      {
        ...opts,
        onConnect: () => {
          const instId = opts.symbol.replace('/', '-');
          const subscribePayload = this.buildSubscribePayload([instId]);
          client.send(subscribePayload);
          opts.onConnect?.();
        },
      },
      data => tickerAdapter(data.data[0])
    );
    return client;
  }

  public subscribeToTikers(
    opts: ISubscribeToTikersOptions
  ): ReadOnlyStremClient<IOkxWebsocketResponse, ITicker[]> {
    const client = this.createClient(
      {
        ...opts,
        onConnect: () => {
          const instIds = opts.symbols.map(s => s.replace('/', '-'));
          const subscribePayload = this.buildSubscribePayload(instIds);
          client.send(subscribePayload);
          opts.onConnect?.();
        },
      },
      data => data.data.map(d => tickerAdapter(d))
    );

    return client;
  }

  private createClient<T>(
    opts: IBaseSubscriptionOptions<T>,
    cb: (data: IOkxWebocketPushResponse) => T
  ): ReadOnlyStremClient<IOkxWebsocketResponse, T> {
    const client = new ReadOnlyStremClient({
      host: this.host,
      handlers: {
        open: opts.onConnect,
        close: opts.onClose,
        message: opts.cb,
      },
      adapter: (data: IOkxWebsocketResponse) => {
        if (data.event === 'subscribe') {
          opts.onSubscribed?.();
          return null;
        }
        if (data.event === 'error') {
          opts.onError?.({
            reason: 'WEB_SOCKET_ERROR',
            info: {
              msg: data.msg,
              code: parseInt(data.code),
              connId: data.connId,
            },
          });
          return null;
        }
        return cb(data);
      },
    });

    return client;
  }

  private buildSubscribePayload(instId: string[]) {
    return {
      op: 'subscribe',
      args: instId.map(instId => ({
        channel: 'tickers',
        instId,
      })),
    };
  }
}
