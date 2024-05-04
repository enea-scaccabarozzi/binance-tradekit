import { describe, expect, it } from 'vitest';

import { IOkxTiker } from '../../../types/okx';
import { IPrice, ITicker } from '../../../types/shared/tickers';
import { priceAdapter, tickerAdapter } from '../adapters';

// Mock data for testing
const mockOkxTicker: IOkxTiker = {
  instType: 'SPOT',
  instId: 'BTC-USDT',
  last: '40000',
  lastSz: '0.5',
  askPx: '40100',
  askSz: '1',
  bidPx: '39900',
  bidSz: '2',
  open24h: '39000',
  high24h: '41000',
  low24h: '38000',
  volCcy24h: 'USD',
  vol24h: '10000',
  sodUtc0: '...',
  sodUtc8: '...',
  ts: '1620109200000', // Example timestamp
};

describe('priceAdapter', () => {
  it('should adapt OKX ticker data to Price object', () => {
    const adaptedData: IPrice = priceAdapter(mockOkxTicker);

    expect(adaptedData).toEqual({
      symbol: 'BTC/USDT',
      datetime: new Date(1620109200000),
      price: 40000,
    });
  });
});

describe('tickerAdapter', () => {
  it('should adapt OKX ticker data to Ticker object', () => {
    const adaptedData: ITicker = tickerAdapter(mockOkxTicker);

    expect(adaptedData).toEqual({
      symbol: 'BTC/USDT',
      datetime: new Date(1620109200000),
      high: 41000,
      low: 38000,
      bid: {
        price: 39900,
        size: 2,
      },
      ask: {
        price: 40100,
        size: 1,
      },
      open: {
        price: 39000,
        datetime: new Date(1620022800000), // Date one day before the timestamp
      },
      last: 40000,
      timeframe: '1d',
    });
  });
});
