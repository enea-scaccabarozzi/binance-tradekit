import { describe, expect, it, vi } from 'vitest';

import { Okx } from '../..';
import { afterEach } from 'node:test';

const createTickerShape = (symbol: string) => ({
  symbol,
  datetime: expect.any(Date),
  high: expect.any(Number),
  low: expect.any(Number),
  bid: {
    price: expect.any(Number),
    size: expect.any(Number),
  },
  ask: {
    price: expect.any(Number),
    size: expect.any(Number),
  },
  open: {
    price: expect.any(Number),
    datetime: expect.any(Date),
  },
  last: expect.any(Number),
  timeframe: expect.any(String),
});

const createPriceShape = (symbol: string) => ({
  symbol,
  price: expect.any(Number),
  datetime: expect.any(Date),
});

const createErrorShape = () => ({
  reason: 'EXCHANGE_ERROR',
  info: {
    statusCode: expect.any(Number),
    code: expect.any(Number),
    msg: expect.any(String),
  },
});

const createWsErrorShape = () => ({
  reason: 'WEB_SOCKET_ERROR',
  info: {
    code: expect.any(Number),
    connId: expect.any(String),
    msg: expect.any(String),
  },
});

describe('[e2e] Okx Market Data', () => {
  const okx = new Okx({});

  describe('getTicker', () => {
    it('should return ticker', async () => {
      const result = await okx.getTicker({ symbol: 'BTC/USDT' });

      expect(result._unsafeUnwrap()).toMatchObject(
        createTickerShape('BTC/USDT')
      );
    });

    it('should return error with unexisting symbol', async () => {
      const result = await okx.getTicker({ symbol: 'XXX/XXX' });

      expect(result._unsafeUnwrapErr()).toMatchObject(createErrorShape());
    });
  });

  describe('getTickers', () => {
    it('should return tickers', async () => {
      const result = await okx.getTickers({
        symbols: ['BTC/USDT', 'ETH/USDT'],
      });

      expect(result._unsafeUnwrap()).toMatchObject([
        createTickerShape('BTC/USDT'),
        createTickerShape('ETH/USDT'),
      ]);
    });

    it('should filters out unexisting symbols', async () => {
      const result = await okx.getTickers({ symbols: ['XXX/XXX', 'BTC/USDT'] });

      expect(result._unsafeUnwrap()).toMatchObject([
        createTickerShape('BTC/USDT'),
      ]);
    });
  });

  describe('getPrice', () => {
    it('should return price', async () => {
      const result = await okx.getPrice({ symbol: 'BTC/USDT' });

      expect(result._unsafeUnwrap()).toEqual(createPriceShape('BTC/USDT'));
    });

    it('should return error with unexisting symbol', async () => {
      const result = await okx.getPrice({ symbol: 'XXX/XXX' });

      expect(result._unsafeUnwrapErr()).toMatchObject(createErrorShape());
    });
  });

  describe('getPrices', () => {
    it('should return prices', async () => {
      const result = await okx.getPrices({
        symbols: ['BTC/USDT', 'ETH/USDT'],
      });

      expect(result._unsafeUnwrap()).toMatchObject([
        createPriceShape('BTC/USDT'),
        createPriceShape('ETH/USDT'),
      ]);
    });

    it('should filters out unexisting symbols', async () => {
      const result = await okx.getPrices({ symbols: ['XXX/XXX', 'BTC/USDT'] });

      expect(result._unsafeUnwrap()).toMatchObject([
        createPriceShape('BTC/USDT'),
      ]);
    });
  });

  describe('subscribeToTicker', () => {
    const onMessage = vi.fn();
    const onSubscribed = vi.fn();
    const onClose = vi.fn();
    const onError = vi.fn();
    const onConnect = vi.fn();

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should subscribe to ticker', async () => {
      const client = okx.subscribeToTiker({
        symbol: 'BTC/USDT',
        cb: onMessage,
        onSubscribed,
        onClose,
        onError,
        onConnect,
      });

      expect(client).toBeDefined();

      // Wait for the subscription to be established
      await new Promise(resolve => setTimeout(resolve, 1500));

      expect(onConnect).toHaveBeenCalled();
      expect(onSubscribed).toHaveBeenCalled();
      expect(onMessage).toHaveBeenCalledWith(createTickerShape('BTC/USDT'));
    });

    it('should handle error', async () => {
      const onMessage = vi.fn();
      const onSubscribed = vi.fn();
      const onClose = vi.fn();
      const onError = vi.fn();
      const onConnect = vi.fn();

      const client = okx.subscribeToTiker({
        symbol: 'XXX/XXX',
        cb: onMessage,
        onSubscribed,
        onClose,
        onError,
        onConnect,
      });

      expect(client).toBeDefined();

      // Wait for the subscription to be established
      await new Promise(resolve => setTimeout(resolve, 1500));

      expect(onConnect).toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(createWsErrorShape());
    });
  });

  describe('subscribeToTickers', () => {
    const onMessage = vi.fn();
    const onSubscribed = vi.fn();
    const onClose = vi.fn();
    const onError = vi.fn();
    const onConnect = vi.fn();

    afterEach(() => {
      vi.clearAllMocks();
    });
    it('should subscribe to tickers', async () => {
      const client = okx.subscribeToTikers({
        symbols: ['BTC/USDT', 'ETH/USDT'],
        cb: onMessage,
        onSubscribed,
        onClose,
        onError,
        onConnect,
      });

      expect(client).toBeDefined();

      // Wait for the subscription to be established
      await new Promise(resolve => setTimeout(resolve, 1500));

      expect(onConnect).toHaveBeenCalled();
      expect(onSubscribed).toHaveBeenCalled();
      expect(onMessage).toBeCalledWith([createTickerShape('BTC/USDT')]);
      expect(onMessage).toHaveBeenCalledWith([createTickerShape('ETH/USDT')]);
    });

    it('should handle error', async () => {
      const client = okx.subscribeToTikers({
        symbols: ['XXX/XXX', 'BTC/USDT'],
        cb: onMessage,
        onSubscribed,
        onClose,
        onError,
        onConnect,
      });

      expect(client).toBeDefined();

      // Wait for the subscription to be established
      await new Promise(resolve => setTimeout(resolve, 1500));

      expect(onConnect).toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(createWsErrorShape());
    });
  });

  describe('subscribeToPrice', () => {
    const onMessage = vi.fn();
    const onSubscribed = vi.fn();
    const onClose = vi.fn();
    const onError = vi.fn();
    const onConnect = vi.fn();

    afterEach(() => {
      vi.clearAllMocks();
    });
    it('should subscribe to price', async () => {
      const client = okx.subscribeToPrice({
        symbol: 'BTC/USDT',
        cb: onMessage,
        onSubscribed,
        onClose,
        onError,
        onConnect,
      });

      expect(client).toBeDefined();

      // Wait for the subscription to be established
      await new Promise(resolve => setTimeout(resolve, 1500));

      expect(onConnect).toHaveBeenCalled();
      expect(onSubscribed).toHaveBeenCalled();
      expect(onMessage).toHaveBeenCalledWith(createPriceShape('BTC/USDT'));
    });

    it('should handle error', async () => {
      const client = okx.subscribeToPrice({
        symbol: 'XXX/XXX',
        cb: onMessage,
        onSubscribed,
        onClose,
        onError,
        onConnect,
      });

      expect(client).toBeDefined();

      // Wait for the subscription to be established
      await new Promise(resolve => setTimeout(resolve, 1500));

      expect(onConnect).toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(createWsErrorShape());
    });
  });

  describe('subscribeToPrices', () => {
    const onMessage = vi.fn();
    const onSubscribed = vi.fn();
    const onClose = vi.fn();
    const onError = vi.fn();
    const onConnect = vi.fn();

    afterEach(() => {
      vi.clearAllMocks();
    });
    it('should subscribe to prices', async () => {
      const client = okx.subscribeToPrices({
        symbols: ['BTC/USDT', 'ETH/USDT'],
        cb: onMessage,
        onSubscribed,
        onClose,
        onError,
        onConnect,
      });

      expect(client).toBeDefined();

      // Wait for the subscription to be established
      await new Promise(resolve => setTimeout(resolve, 1500));

      expect(onConnect).toHaveBeenCalled();
      expect(onSubscribed).toHaveBeenCalled();
      expect(onMessage).toBeCalledWith([createPriceShape('BTC/USDT')]);
      expect(onMessage).toHaveBeenCalledWith([createPriceShape('ETH/USDT')]);
    });

    it('should handle error', async () => {
      const client = okx.subscribeToPrices({
        symbols: ['XXX/XXX', 'BTC/USDT'],
        cb: onMessage,
        onSubscribed,
        onClose,
        onError,
        onConnect,
      });

      expect(client).toBeDefined();

      // Wait for the subscription to be established
      await new Promise(resolve => setTimeout(resolve, 1500));

      expect(onConnect).toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(createWsErrorShape());
    });
  });
});
