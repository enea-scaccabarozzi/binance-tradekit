/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { ok } from 'neverthrow';

import { IPrice, ITicker } from '../../../types/shared/tickers';
import { Okx } from '../..';

// Mock the external modules
vi.mock('../market-data');
vi.mock('../../../shared/websocket');
vi.mock('../../../shared/proxy', async () => {
  const original = await vi.importActual('../../../shared/proxy');

  return {
    ...original,
    getBaseInstance: vi.fn(() => ({
      defaults: {
        baseURL: 'https://www.okx.com/',
      },
    })),
  };
});

const mockedPrice: IPrice = {
  symbol: 'BTC/USDT',
  price: 100,
  datetime: new Date(),
};

const mockedTiker: ITicker = {
  symbol: 'BTC/USDT',
  datetime: new Date(),
  high: 69,
  low: 42,
  bid: {
    price: 50,
    size: 11,
  },
  ask: {
    price: 50,
    size: 11,
  },
  open: {
    price: 11,
    datetime: new Date(),
  },
  last: 55,
  timeframe: '1d',
};

const baseWsOpts = {
  cb: vi.fn(),
};

describe('Okx', () => {
  const okx = new Okx({});

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize itself correctly', () => {
    expect(okx).toBeInstanceOf(Okx);
  });

  it('getPrice', async () => {
    const getPriceSpy = vi
      .spyOn(okx, 'getPrice')
      .mockResolvedValue(ok(mockedPrice));

    const options = { symbol: 'BTC/USDT' };
    const result = await okx.getPrice(options);

    // Check that the result is as expected
    expect(result._unsafeUnwrap()).toEqual(mockedPrice);
    expect(getPriceSpy).toHaveBeenCalledWith(options);
  });

  it('getPrices', async () => {
    const getPricesSpy = vi
      .spyOn(okx, 'getPrices')
      .mockResolvedValue(ok([mockedPrice]));

    const options = { symbols: ['BTC/USDT'] };
    const result = await okx.getPrices(options);

    // Check that the result is as expected
    expect(result._unsafeUnwrap()).toEqual([mockedPrice]);

    expect(getPricesSpy).toHaveBeenCalledWith(options);
  });

  it('getTicker', async () => {
    const getTickerSpy = vi
      .spyOn(okx, 'getTicker')
      .mockResolvedValue(ok(mockedTiker));

    const options = { symbol: 'BTC/USDT' };
    const result = await okx.getTicker(options);

    // Check that the result is as expected
    expect(result._unsafeUnwrap()).toEqual(mockedTiker);

    expect(getTickerSpy).toHaveBeenCalledWith(options);
  });

  it('getTickers', async () => {
    const getTickersSpy = vi
      .spyOn(okx, 'getTickers')
      .mockResolvedValue(ok([mockedTiker]));

    const options = { symbols: ['BTC/USDT'] };
    const result = await okx.getTickers(options);

    // Check that the result is as expected
    expect(result._unsafeUnwrap()).toEqual([mockedTiker]);

    expect(getTickersSpy).toHaveBeenCalledWith(options);
  });

  it('subscribeToPrice', () => {
    const subscribeToPriceSpy = vi
      .spyOn(okx, 'subscribeToPrice')
      .mockReturnValue({} as any);

    const options = { ...baseWsOpts, symbol: 'BTC/USDT' };
    const result = okx.subscribeToPrice(options);

    // Check that the result is as expected
    expect(result).toBeDefined();

    expect(subscribeToPriceSpy).toHaveBeenCalledWith(options);
  });

  it('subscribeToPrices', () => {
    const subscribeToPricesSpy = vi
      .spyOn(okx, 'subscribeToPrices')
      .mockReturnValue({} as any);

    const options = { ...baseWsOpts, symbols: ['BTC/USDT'] };
    const result = okx.subscribeToPrices(options);

    // Check that the result is as expected
    expect(result).toBeDefined();

    expect(subscribeToPricesSpy).toHaveBeenCalledWith(options);
  });

  it('subscribeToTiker', () => {
    const subscribeToTikerSpy = vi
      .spyOn(okx, 'subscribeToTiker')
      .mockReturnValue({} as any);

    const options = { ...baseWsOpts, symbol: 'BTC/USDT' };
    const result = okx.subscribeToTiker(options);

    // Check that the result is as expected
    expect(result).toBeDefined();

    expect(subscribeToTikerSpy).toHaveBeenCalledWith(options);
  });

  it('subscribeToTikers', () => {
    const subscribeToTikersSpy = vi
      .spyOn(okx, 'subscribeToTikers')
      .mockReturnValue({} as any);

    const options = { ...baseWsOpts, symbols: ['BTC/USDT'] };
    const result = okx.subscribeToTikers(options);

    // Check that the result is as expected
    expect(result).toBeDefined();

    expect(subscribeToTikersSpy).toHaveBeenCalledWith(options);
  });
});
