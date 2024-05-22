import { WebsocketClient } from 'bybit-api';

import { TradekitError } from '../types/shared/errors';
import { StreamClient } from '../types/shared/websocket';
import { BaseSubscriptionOptions, Ticker } from '../types/shared/tickers';
import { BybitWssUpdate, BybitWssUpdateSnapshot } from '../types/bybit';

export class BybitStreamClient implements StreamClient {
  private ws: WebsocketClient;
  private currentSnapshot: BybitWssUpdateSnapshot | null = null;
  private symbolsMap: Map<string, string> = new Map();

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
        }
        if (this.currentSnapshot) {
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
      symbols
        .map(s => s.replace('/', ''))
        .map(s => s.split(':')[0])
        .forEach((symbol, i) => {
          this.symbolsMap.set(symbol, symbols[i]);
        });
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

  private tickerAdapter = (snapshot: BybitWssUpdateSnapshot): Ticker => {
    const {
      symbol,
      lastPrice,
      prevPrice24h,
      highPrice24h,
      lowPrice24h,
      volume24h,
      turnover24h,
    } = snapshot.data;

    return {
      symbol: this.symbolsMap.get(symbol) || symbol,
      timestamp: snapshot.ts,
      datetime: new Date(snapshot.ts),
      last: parseFloat(lastPrice),
      close: parseFloat(lastPrice),
      absChange: parseFloat(prevPrice24h) - parseFloat(lastPrice),
      percChange: parseFloat(snapshot.data.price24hPcnt),
      high: parseFloat(highPrice24h),
      low: parseFloat(lowPrice24h),
      volume: parseFloat(volume24h),
      baseVolume: parseFloat(volume24h),
      quoteVolume: parseFloat(turnover24h),
      open: parseFloat(prevPrice24h),
      openTime: new Date(snapshot.ts - 24 * 60 * 60 * 1000),
      info: snapshot.data,
    };
  };
}
