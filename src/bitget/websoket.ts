import { WebsocketClientV2 } from 'bitget-api';

import { TradekitError } from '../types/shared/errors';
import { StreamClient } from '../types/shared/websocket';
import { BaseSubscriptionOptions, Ticker } from '../types/shared/tickers';
import {
  BitgetWssError,
  BitgetWssUpdate,
  BitgetWssTiker,
} from '../types/bitget';
import { normalizeSymbol } from './utils';

export class BitgetStreamClient implements StreamClient {
  private ws: WebsocketClientV2;
  private currentSnapshots: Map<string, BitgetWssTiker> = new Map();
  private symbolsMap: Map<string, string> = new Map();

  constructor(
    opts: BaseSubscriptionOptions<Ticker> & {
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

    this.ws = new WebsocketClientV2({}, customLogger);

    this.ws.on('close', () => {
      if (opts.onClose) opts.onClose();
    });
    this.ws.on('open', () => {
      if (opts.onSubscription) opts.onSubscription();
    });
    this.ws.on('exception', err => {
      const error = this.handleErros(err);
      if (opts.onError) opts.onError(error);
    });

    this.ws.on('update', (event: BitgetWssUpdate) => {
      if (event.action === 'snapshot') {
        event.data.forEach(d => {
          this.currentSnapshots.set(`${d.instId}--${event.arg.instType}`, d);
        });
      } else {
        event.data.forEach(d => {
          if (d.instId) {
            const snapshot = this.currentSnapshots.get(
              `${d.instId}--${event.arg.instType}`
            );
            if (snapshot) {
              this.currentSnapshots.set(`${d.instId}--${event.arg.instType}`, {
                ...snapshot,
                ...d,
              });
            }
          }
        });
      }
      this.currentSnapshots.forEach(snapshot => {
        const ticker = this.tickerAdapter(snapshot);
        opts.onUpdate(ticker);
      });
    });

    opts.symbols
      .map(symbol => normalizeSymbol(symbol, false))
      .forEach((symbol, i) => {
        this.symbolsMap.set(symbol, opts.symbols[i]);
        this.ws.subscribeTopic('USDT-FUTURES', 'ticker', symbol);
      });
  }

  public close(): void {
    this.ws.closeAll();
  }

  private handleErros = (error: any): TradekitError => {
    try {
      const parsed = JSON.parse(error) as BitgetWssError;
      return {
        reason: 'WEB_SOCKET_ERROR',
        info: {
          msg: parsed.msg,
          code: 'HANDLED_ERROR',
          connId: parsed.wsKey,
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

  private tickerAdapter = (data: BitgetWssTiker): Ticker => {
    const {
      instId,
      lastPr,
      open24h,
      high24h,
      low24h,
      baseVolume,
      quoteVolume,
      openUtc,
      ts,
    } = data;

    const timestamp = parseInt(ts, 10);
    const datetime = new Date(timestamp);
    const openTime = new Date(parseInt(openUtc, 10) * 1000);
    const last = parseFloat(lastPr);
    const open = parseFloat(open24h);
    const high = parseFloat(high24h);
    const low = parseFloat(low24h);
    const volume = parseFloat(baseVolume);
    const absChange = last - open;
    const percChange = (absChange / open) * 100;

    return {
      symbol: this.symbolsMap.get(instId) || instId,
      timestamp,
      datetime,
      last,
      close: last, // Assuming 'close' is the same as 'last'
      absChange,
      percChange,
      high,
      low,
      volume,
      baseVolume: parseFloat(baseVolume),
      quoteVolume: parseFloat(quoteVolume),
      open,
      openTime,
      info: data,
    };
  };
}
