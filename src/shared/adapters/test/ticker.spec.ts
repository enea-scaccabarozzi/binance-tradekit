import { describe, it, expect } from 'vitest';
import { Ticker as CCXTTicker } from 'ccxt';

import { ccxtTickerAdapter } from '../ticker';
import { createError } from '../shared';
import { Ticker } from '../../../types/shared/tickers';
import { TradekitResult } from '../../../types/shared/errors';

describe('ccxtTickerAdapter', () => {
  it('should return an error if any ticker data is missing', () => {
    const incompleteTicker: CCXTTicker = {
      symbol: 'BTC/USD',
      last: 50000,
      // missing other required fields
    } as CCXTTicker;

    // eslint-disable-next-line neverthrow/must-use-result
    const result: TradekitResult<Ticker> = ccxtTickerAdapter(incompleteTicker);

    expect(result._unsafeUnwrapErr()).toEqual(
      createError('Missing ticker data')
    );
  });

  it('should adapt a complete ticker correctly', () => {
    const completeTicker: CCXTTicker = {
      symbol: 'BTC/USD',
      last: 50000,
      close: 50000,
      change: 100,
      percentage: 0.2,
      high: 51000,
      low: 49000,
      baseVolume: 1000,
      quoteVolume: 50000000,
      open: 49000,
      timestamp: 1625260800000,
      datetime: '2021-07-03T00:00:00Z',
      info: { some: 'info' },
    } as CCXTTicker;

    const now = new Date().getTime();
    const openTime = new Date(now - 86400000);

    const expectedTicker: Ticker = {
      symbol: 'BTC/USD',
      timestamp: 1625260800000,
      datetime: new Date('2021-07-03T00:00:00Z'),
      last: 50000,
      close: 50000,
      absChange: 100,
      percChange: 0.2,
      high: 51000,
      low: 49000,
      volume: 1000,
      baseVolume: 1000,
      quoteVolume: 50000000,
      open: 49000,
      openTime: new Date(openTime),
      info: { some: 'info' },
    };

    const result: TradekitResult<Ticker> = ccxtTickerAdapter(completeTicker);

    expect(result._unsafeUnwrap()).toEqual(expectedTicker);
  });

  it('should use the current time if timestamp or datetime is missing', () => {
    const partialTicker: CCXTTicker = {
      symbol: 'BTC/USD',
      last: 50000,
      close: 50000,
      change: 100,
      percentage: 0.2,
      high: 51000,
      low: 49000,
      baseVolume: 1000,
      quoteVolume: 50000000,
      open: 49000,
      // missing timestamp and datetime
    } as CCXTTicker;

    const now = new Date().getTime();
    const openTime = new Date(now - 86400000);

    const result: TradekitResult<Ticker> = ccxtTickerAdapter(partialTicker);

    const okResult = result._unsafeUnwrap(); // Access the result directly for testing purposes

    expect(okResult.timestamp).toBeCloseTo(now, -2); // Allowing a small margin for timing differences
    expect(okResult.datetime.getTime()).toBeCloseTo(now, -2);
    expect(okResult.openTime.getTime()).toBeCloseTo(openTime.getTime(), -2);
  });
});
