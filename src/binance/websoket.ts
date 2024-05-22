import {
  WebsocketClient,
  WsMessage24hrTickerFormatted,
  DefaultLogger,
} from 'binance';

import { TradekitError } from '../types/shared/errors';
import { StreamClient } from '../types/shared/websocket';
import { BaseSubscriptionOptions, Ticker } from '../types/shared/tickers';
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
      timestamp: data.eventTime,
      datetime: new Date(data.eventTime),
      last: data.currentClose,
      close: data.currentClose,
      absChange: data.priceChange,
      percChange: data.priceChangePercent,
      high: data.high,
      low: data.low,
      volume: data.baseAssetVolume,
      baseVolume: data.baseAssetVolume,
      quoteVolume: data.quoteAssetVolume,
      open: data.open,
      openTime: new Date(data.openTime),
      info: data,
    };
  };
}
