import { Ticker as CCXTTicker } from 'ccxt';
import { err, ok } from 'neverthrow';

import { Ticker } from '../../types/shared/tickers';
import { TradekitResult } from '../../types/shared/errors';
import { createError } from './shared';

export const ccxtTickerAdapter = (
  ticker: CCXTTicker
): TradekitResult<Ticker> => {
  if (
    !ticker.symbol ||
    !ticker.last ||
    !ticker.close ||
    !ticker.change ||
    !ticker.percentage ||
    !ticker.high ||
    !ticker.low ||
    !ticker.baseVolume ||
    !ticker.quoteVolume ||
    !ticker.open
  ) {
    return err(createError('Missing ticker data'));
  }

  const now = new Date().getTime();
  const openTime = new Date(now - 86400000);

  return ok({
    symbol: ticker.symbol,
    timestamp: ticker.timestamp ?? now,
    datetime: new Date(ticker.datetime ?? now),
    last: ticker.last,
    close: ticker.close,
    absChange: ticker.change,
    percChange: ticker.percentage,
    high: ticker.high,
    low: ticker.low,
    volume: ticker.baseVolume,
    baseVolume: ticker.baseVolume,
    quoteVolume: ticker.quoteVolume,
    open: ticker.open,
    openTime: new Date(openTime),
    info: ticker.info,
  });
};
