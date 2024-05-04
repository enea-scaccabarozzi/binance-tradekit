import { describe, it, expect, vi, afterEach } from 'vitest';
import { OkxMarketDataHandler } from '../index';
import { ProxyRotator } from '../../../shared/proxy';
import { IPrice, ITicker } from '../../../types/shared/tickers';
import { ok } from 'neverthrow';

// Mock the external modules
vi.mock('../../http');
vi.mock('../../websocket');
vi.mock('../../../../shared/proxy');

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

describe('OkxMarketDataHandler', () => {
  const proxyRotator = new ProxyRotator({});
  const handler = new OkxMarketDataHandler(proxyRotator);

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('getPrice', async () => {
    const getPriceSpy = vi
      .spyOn(handler, 'getPrice')
      .mockResolvedValue(ok(mockedPrice));

    const options = { symbol: 'BTC/USDT' };
    const result = await handler.getPrice(options);

    // Check that the result is as expected
    expect(result._unsafeUnwrap()).toEqual(mockedPrice);
    expect(getPriceSpy).toHaveBeenCalledWith(options);
  });

  it('getPrices', async () => {
    const getPricesSpy = vi
      .spyOn(handler, 'getPrices')
      .mockResolvedValue(ok([mockedPrice]));

    const options = { symbols: ['BTC/USDT'] };
    const result = await handler.getPrices(options);

    // Check that the result is as expected
    expect(result._unsafeUnwrap()).toEqual([mockedPrice]);

    expect(getPricesSpy).toHaveBeenCalledWith(options);
  });

  it('getTicker', async () => {
    const getTickerSpy = vi
      .spyOn(handler, 'getTicker')
      .mockResolvedValue(ok(mockedTiker));

    const options = { symbol: 'BTC/USDT' };
    const result = await handler.getTicker(options);

    // Check that the result is as expected
    expect(result._unsafeUnwrap()).toEqual(mockedTiker);

    expect(getTickerSpy).toHaveBeenCalledWith(options);
  });

  it('getTickers', async () => {
    const getTickersSpy = vi
      .spyOn(handler, 'getTickers')
      .mockResolvedValue(ok([mockedTiker]));

    const options = { symbols: ['BTC/USDT'] };
    const result = await handler.getTickers(options);

    // Check that the result is as expected
    expect(result._unsafeUnwrap()).toEqual([mockedTiker]);

    expect(getTickersSpy).toHaveBeenCalledWith(options);
  });

  it('subscribeToPrice', () => {
    const subscribeToPriceSpy = vi
      .spyOn(handler, 'subscribeToPrice')
      .mockReturnValue({} as any);

    const options = { ...baseWsOpts, symbol: 'BTC/USDT' };
    const result = handler.subscribeToPrice(options);

    // Check that the result is as expected
    expect(result).toBeDefined();

    expect(subscribeToPriceSpy).toHaveBeenCalledWith(options);
  });

  it('subscribeToPrices', () => {
    const subscribeToPricesSpy = vi
      .spyOn(handler, 'subscribeToPrices')
      .mockReturnValue({} as any);

    const options = { ...baseWsOpts, symbols: ['BTC/USDT'] };
    const result = handler.subscribeToPrices(options);

    // Check that the result is as expected
    expect(result).toBeDefined();

    expect(subscribeToPricesSpy).toHaveBeenCalledWith(options);
  });

  it('subscribeToTiker', () => {
    const subscribeToTikerSpy = vi
      .spyOn(handler, 'subscribeToTiker')
      .mockReturnValue({} as any);

    const options = { ...baseWsOpts, symbol: 'BTC/USDT' };
    const result = handler.subscribeToTiker(options);

    // Check that the result is as expected
    expect(result).toBeDefined();

    expect(subscribeToTikerSpy).toHaveBeenCalledWith(options);
  });

  it('subscribeToTikers', () => {
    const subscribeToTikersSpy = vi
      .spyOn(handler, 'subscribeToTikers')
      .mockReturnValue({} as any);

    const options = { ...baseWsOpts, symbols: ['BTC/USDT'] };
    const result = handler.subscribeToTikers(options);

    // Check that the result is as expected
    expect(result).toBeDefined();

    expect(subscribeToTikersSpy).toHaveBeenCalledWith(options);
  });
});
