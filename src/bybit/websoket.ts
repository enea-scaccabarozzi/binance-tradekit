import { WebsocketClient } from 'bybit-api';
import { Ticker } from 'ccxt';

import { TradekitError } from '../types/shared/errors';
import { StreamClient } from '../types/shared/websocket';
import { BaseSubscriptionOptions } from '../types/shared/tickers';
import { BybitWssUpdate, BybitWssUpdateSnapshot } from '../types/bybit';

export class BybitStreamClient implements StreamClient {
  private ws: WebsocketClient;
  private currentSnapshot: BybitWssUpdateSnapshot | null = null;

  constructor(
    opts: BaseSubscriptionOptions<Ticker> & {
      testnet: boolean;
      symbols: string[];
    }
  ) {
    const customLogger = {
      silly: () => null,
      info: () => null,
      debug: () => null,
      error: () => null,
      notice: () => null,
      warning: () => null,
    };

    this.ws = new WebsocketClient(
      {
        testnet: opts.testnet,
        market: 'v5',
      },
      customLogger
    );

    this.ws.on('close', () => {
      if (opts.onClose) opts.onClose();
    });
    this.ws.on('open', () => {
      if (opts.onSubscription) opts.onSubscription();
    });
    this.ws.on('error', err => {
      const error = this.handleErros(err);
      if (opts.onError) opts.onError(error);
    });

    this.ws.on('update', (data: BybitWssUpdate) => {
      if (data.type === 'snapshot') {
        this.currentSnapshot = data;
      } else {
        if (this.currentSnapshot) {
          this.currentSnapshot = {
            ...this.currentSnapshot,
            data: {
              ...this.currentSnapshot.data,
              ...data.data,
            },
          };
          const ticker = this.tickerAdapter(this.currentSnapshot);
          opts.onUpdate(ticker);
        }
      }
    });

    void this.subscribeToTicker(opts.symbols);
  }

  public close(): void {
    this.ws.closeAll();
  }

  private async subscribeToTicker(symbols: string[]): Promise<void> {
    try {
      await this.ws.subscribeV5(
        symbols
          .map(s => s.replace('/', '').split(':')[0])
          .map(s => `tickers.${s}`),
        'linear'
      );
      // eslint-disable-next-line no-empty
    } catch (e) {}
  }

  private handleErros = (error: any): TradekitError => {
    try {
      const parsed = JSON.parse(error) as {
        success: boolean;
        ret_msg: string;
        conn_id: string;
        req_id: string;
      };
      return {
        reason: 'WEB_SOCKET_ERROR',
        info: {
          msg: parsed.ret_msg,
          code: 'HANDLED_ERROR',
          connId: parsed.conn_id,
        },
      };
    } catch (e) {
      return {
        reason: 'WEB_SOCKET_ERROR',
        info: {
          msg: 'It was not possible to parse the error message',
          code: 'UNHANDLED_ERROR',
          connId: 'N/A',
        },
      };
    }
  };

  private tickerAdapter = ({ data }: BybitWssUpdateSnapshot): Ticker => {
    const timestamp = Date.now();
    const datetime = new Date(timestamp).toISOString();
    return {
      symbol: data.symbol,
      info: data,
      timestamp: timestamp,
      datetime: datetime,
      high: parseFloat(data.highPrice24h),
      low: parseFloat(data.lowPrice24h),
      bid: parseFloat(data.bid1Price),
      bidVolume: parseFloat(data.bid1Size),
      ask: parseFloat(data.ask1Price),
      askVolume: parseFloat(data.ask1Size),
      vwap: parseFloat(data.turnover24h) / parseFloat(data.volume24h) || 0,
      open: parseFloat(data.prevPrice24h),
      close: parseFloat(data.lastPrice),
      last: parseFloat(data.lastPrice),
      previousClose: parseFloat(data.prevPrice24h),
      change: parseFloat(data.lastPrice) - parseFloat(data.prevPrice24h),
      percentage: parseFloat(data.price24hPcnt),
      average:
        (parseFloat(data.highPrice24h) + parseFloat(data.lowPrice24h)) / 2,
      quoteVolume: parseFloat(data.turnover24h),
      baseVolume: parseFloat(data.volume24h),
    };
  };
}
