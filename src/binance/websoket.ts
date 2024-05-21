import {
  WebsocketClient,
  WsMessage24hrTickerFormatted,
  DefaultLogger,
} from 'binance';
import { Ticker } from 'ccxt';

import { TradekitError } from '../types/shared/errors';
import { StreamClient } from '../types/shared/websocket';
import { BaseSubscriptionOptions } from '../types/shared/tickers';
import { BinanceWssUpdate } from '../types/binance';

export class BinanceStreamClient implements StreamClient {
  private ws: WebsocketClient;

  constructor(
    opts: BaseSubscriptionOptions<Ticker> & {
      symbols: string[];
    }
  ) {
    DefaultLogger.info = () => null;
    DefaultLogger.debug = () => null;
    DefaultLogger.error = () => null;
    DefaultLogger.notice = () => null;
    DefaultLogger.silly = () => null;
    DefaultLogger.warning = () => null;

    this.ws = new WebsocketClient({
      beautify: true,
    });

    this.ws.on('close', () => {
      if (opts.onClose) opts.onClose();
    });
    this.ws.on('open', () => {
      if (opts.onSubscription) opts.onSubscription();
    });
    this.ws.on('error', err => {
      console.log(err);
      const error = this.handleErros(err);
      if (opts.onError) opts.onError(error);
    });

    this.ws.on('formattedMessage', data => {
      const ticker = this.tickerAdapter(data as WsMessage24hrTickerFormatted);
      opts.onUpdate(ticker);
    });

    opts.symbols
      .map(symbol => symbol.replace('/', ''))
      .map(symbol => symbol.split(':')[0])
      .forEach(symbol => {
        this.ws.subscribeSymbol24hrTicker(symbol, 'usdm');
      });
  }

  public close(): void {
    this.ws.closeAll();
  }

  private handleErros = (error: any): TradekitError => {
    try {
      const parsed = JSON.parse(error) as {
        error: {
          message: string;
        };
        wsKey: string;
      };
      return {
        reason: 'WEB_SOCKET_ERROR',
        info: {
          msg: parsed.error.message,
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

  private tickerAdapter = (data: BinanceWssUpdate): Ticker => {
    return {
      symbol: data.symbol,
      info: data,
      timestamp: Math.floor(data.eventTime / 1000),
      datetime: new Date(data.eventTime).toISOString(),
      high: Math.floor(data.high),
      low: Math.floor(data.low),
      bid: Math.floor(data.currentClose),
      bidVolume: undefined,
      ask: undefined,
      askVolume: undefined,
      vwap: Math.floor(data.weightedAveragePrice),
      open: Math.floor(data.open),
      close: Math.floor(data.currentClose),
      last: Math.floor(data.currentClose),
      previousClose: undefined,
      change: Math.floor(data.priceChange),
      percentage: Math.floor(data.priceChangePercent * 100),
      average: undefined,
      quoteVolume: Math.floor(data.quoteAssetVolume),
      baseVolume: Math.floor(data.baseAssetVolume),
    };
  };
}
