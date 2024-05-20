import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';
import * as ccxt from 'ccxt';

import { Binance } from '../index';
import { TradekitOptions } from '../../types/shared';
import {
  SubscribeToTikerOptions,
  SubscribeToTikersOptions,
} from '../../types/shared/tickers';

// Mock the ccxt.binance class
vi.mock('ccxt', async () => {
  const originalModule = await vi.importActual('ccxt');
  return {
    ...originalModule,
    binance: vi.fn().mockImplementation(() => ({
      fetchTicker: vi.fn(),
      fetchTickers: vi.fn(),
      fetchBalance: vi.fn(),
      setLeverage: vi.fn(),
      createMarketOrder: vi.fn(),
      fetchOpenOrders: vi.fn(),
      cancelOrder: vi.fn(),
      setSandboxMode: vi.fn(),
      options: {},
    })),
  };
});

// Mock the handleError function
vi.mock('../errors.ts', () => ({
  handleError: vi.fn().mockImplementation((e: Error) => ({
    message: 'error',
    details: e.message,
  })),
}));

describe('Binance', () => {
  let binance: Binance;
  let exchangeMock: Mocked<ccxt.binance>;

  beforeEach(() => {
    const opts: TradekitOptions = {
      auth: { key: 'test', secret: 'test' },
      sandbox: true,
    };
    binance = new Binance(opts);
    exchangeMock = binance['exchange'] as Mocked<ccxt.binance>;
  });

  describe('getTicker', () => {
    it('should fetch ticker and rotate proxy', async () => {
      exchangeMock.fetchTicker.mockResolvedValue({
        symbol: 'BTC/USDT',
      } as ccxt.Ticker);
      const rotateProxySpy = vi.spyOn(binance, 'rotateProxy');
      const syncProxySpy = vi.spyOn(binance, 'syncProxy' as keyof Binance);

      const result = await binance.getTicker({ symbol: 'BTC/USDT' });

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual({ symbol: 'BTC/USDT' });
      expect(rotateProxySpy).toHaveBeenCalled();
      expect(syncProxySpy).toHaveBeenCalled();
    });

    it('should handle error and rotate proxy', async () => {
      const error = new Error('Test error');
      exchangeMock.fetchTicker.mockRejectedValue(error);
      const rotateProxySpy = vi.spyOn(binance, 'rotateProxy');
      const syncProxySpy = vi.spyOn(binance, 'syncProxy' as keyof Binance);

      const result = await binance.getTicker({ symbol: 'BTC/USDT' });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toEqual({
        message: 'error',
        details: 'Test error',
      });
      expect(rotateProxySpy).toHaveBeenCalled();
      expect(syncProxySpy).toHaveBeenCalled();
    });
  });

  describe('getTickers', () => {
    it('should fetch tickers and rotate proxy', async () => {
      exchangeMock.fetchTickers.mockResolvedValue({
        'BTC/USDT': { symbol: 'BTC/USDT' } as ccxt.Ticker,
        'ETH/USDT': { symbol: 'ETH/USDT' } as ccxt.Ticker,
      } as ccxt.Tickers);
      const rotateProxySpy = vi.spyOn(binance, 'rotateProxy');
      const syncProxySpy = vi.spyOn(binance, 'syncProxy' as keyof Binance);

      const result = await binance.getTickers({
        symbols: ['BTC/USDT', 'ETH/USDT'],
      });

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual([
        { symbol: 'BTC/USDT' },
        { symbol: 'ETH/USDT' },
      ]);
      expect(rotateProxySpy).toHaveBeenCalled();
      expect(syncProxySpy).toHaveBeenCalled();
    });

    it('should handle error and rotate proxy', async () => {
      const error = new Error('Test error');
      exchangeMock.fetchTickers.mockRejectedValue(error);
      const rotateProxySpy = vi.spyOn(binance, 'rotateProxy');
      const syncProxySpy = vi.spyOn(binance, 'syncProxy' as keyof Binance);

      const result = await binance.getTickers({
        symbols: ['BTC/USDT', 'ETH/USDT'],
      });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toEqual({
        message: 'error',
        details: 'Test error',
      });
      expect(rotateProxySpy).toHaveBeenCalled();
      expect(syncProxySpy).toHaveBeenCalled();
    });
  });

  describe('subscribeToTicker', () => {
    it('should not be implemented', () => {
      const options: SubscribeToTikerOptions = {
        symbol: 'BTC/USDT',
        onUpdate: vi.fn(),
      };

      const result = binance.subscribeToTicker(options);

      expect(result.isErr()).toBe(true);
    });
  });

  describe('subscribeToTickers', () => {
    it('should not be implemented', () => {
      const options: SubscribeToTikersOptions = {
        symbols: ['BTC/USDT'],
        onUpdate: vi.fn(),
      };

      const result = binance.subscribeToTickers(options);

      expect(result.isErr()).toBe(true);
    });
  });

  describe('getBalance', () => {
    it('should fetch balance and rotate proxy', async () => {
      const balance = {
        free: {},
        used: {},
        total: {},
        debt: {},
        info: {},
        datetime: '',
      } as unknown as ccxt.Balances;
      exchangeMock.fetchBalance.mockResolvedValue(balance);
      const rotateProxySpy = vi.spyOn(binance, 'rotateProxy');
      const syncProxySpy = vi.spyOn(binance, 'syncProxy' as keyof Binance);

      const result = await binance.getBalance();

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual(balance);
      expect(rotateProxySpy).toHaveBeenCalled();
      expect(syncProxySpy).toHaveBeenCalled();
    });

    it('should handle error and rotate proxy', async () => {
      const error = new Error('Test error');
      exchangeMock.fetchBalance.mockRejectedValue(error);
      const rotateProxySpy = vi.spyOn(binance, 'rotateProxy');
      const syncProxySpy = vi.spyOn(binance, 'syncProxy' as keyof Binance);

      const result = await binance.getBalance();

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toEqual({
        message: 'error',
        details: 'Test error',
      });
      expect(rotateProxySpy).toHaveBeenCalled();
      expect(syncProxySpy).toHaveBeenCalled();
    });

    it('should filter balance by currencies and rotate proxy', async () => {
      const balance = {
        free: { BTC: 1, ETH: 2 },
        used: { BTC: 0.5, ETH: 1 },
        total: { BTC: 1.5, ETH: 3 },
        info: {},
        datetime: '',
      } as unknown as ccxt.Balances;
      exchangeMock.fetchBalance.mockResolvedValue(balance);
      const rotateProxySpy = vi.spyOn(binance, 'rotateProxy');
      const syncProxySpy = vi.spyOn(binance, 'syncProxy' as keyof Binance);

      const result = await binance.getBalance({ currencies: ['BTC'] });

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual({
        free: { BTC: 1 },
        used: { BTC: 0.5 },
        total: { BTC: 1.5 },
        info: {},
        datetime: '',
        BTC: balance.BTC,
      });
      expect(rotateProxySpy).toHaveBeenCalled();
      expect(syncProxySpy).toHaveBeenCalled();
    });
  });

  describe('setLeverage', () => {
    it('should set leverage and rotate proxy', async () => {
      exchangeMock.setLeverage.mockResolvedValue(undefined);
      const rotateProxySpy = vi.spyOn(binance, 'rotateProxy');
      const syncProxySpy = vi.spyOn(binance, 'syncProxy' as keyof Binance);

      const result = await binance.setLeverage({
        leverage: 10,
        symbol: 'BTC/USDT',
      });

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual(10);
      expect(rotateProxySpy).toHaveBeenCalled();
      expect(syncProxySpy).toHaveBeenCalled();
    });

    it('should handle error and rotate proxy', async () => {
      const error = new Error('Test error');
      exchangeMock.setLeverage.mockRejectedValue(error);
      const rotateProxySpy = vi.spyOn(binance, 'rotateProxy');
      const syncProxySpy = vi.spyOn(binance, 'syncProxy' as keyof Binance);

      const result = await binance.setLeverage({
        leverage: 10,
        symbol: 'BTC/USDT',
      });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toEqual({
        message: 'error',
        details: 'Test error',
      });
      expect(rotateProxySpy).toHaveBeenCalled();
      expect(syncProxySpy).toHaveBeenCalled();
    });

    it('should return ok if leverage is already set', async () => {
      const error = new ccxt.ExchangeError('binance {"retCode":110043}');
      exchangeMock.setLeverage.mockRejectedValue(error);
      const rotateProxySpy = vi.spyOn(binance, 'rotateProxy');
      const syncProxySpy = vi.spyOn(binance, 'syncProxy' as keyof Binance);

      const result = await binance.setLeverage({
        leverage: 10,
        symbol: 'BTC/USDT',
      });

      expect(result._unsafeUnwrap()).toEqual(10);
      expect(rotateProxySpy).toHaveBeenCalled();
      expect(syncProxySpy).toHaveBeenCalled();
    });

    it('should return err if exchange return other error', async () => {
      const error = new ccxt.ExchangeError('binance {"retCode":42}');
      exchangeMock.setLeverage.mockRejectedValue(error);
      const rotateProxySpy = vi.spyOn(binance, 'rotateProxy');
      const syncProxySpy = vi.spyOn(binance, 'syncProxy' as keyof Binance);

      const result = await binance.setLeverage({
        leverage: 10,
        symbol: 'BTC/USDT',
      });

      expect(result.isErr()).toBe(true);
      expect(rotateProxySpy).toHaveBeenCalled();
      expect(syncProxySpy).toHaveBeenCalled();
    });
  });

  describe('openLong', () => {
    it('should open long position and rotate proxy', async () => {
      const order = { id: '1' } as ccxt.Order;
      exchangeMock.createMarketOrder.mockResolvedValue(order);
      exchangeMock.fetchOpenOrders.mockResolvedValue([]);
      const rotateProxySpy = vi.spyOn(binance, 'rotateProxy');
      const syncProxySpy = vi.spyOn(binance, 'syncProxy' as keyof Binance);

      const result = await binance.openLong({ symbol: 'BTC/USDT', amount: 1 });

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual(order);
      expect(rotateProxySpy).toHaveBeenCalled();
      expect(syncProxySpy).toHaveBeenCalled();
    });

    it('should handle error and rotate proxy', async () => {
      const error = new Error('Test error');
      exchangeMock.createMarketOrder.mockRejectedValue(error);
      const rotateProxySpy = vi.spyOn(binance, 'rotateProxy');
      const syncProxySpy = vi.spyOn(binance, 'syncProxy' as keyof Binance);

      const result = await binance.openLong({ symbol: 'BTC/USDT', amount: 1 });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toEqual({
        message: 'error',
        details: 'Test error',
      });
      expect(rotateProxySpy).toHaveBeenCalled();
      expect(syncProxySpy).toHaveBeenCalled();
    });

    it('should return error if order is not filled and timeout', async () => {
      const order = { id: '1' } as ccxt.Order;
      exchangeMock.createMarketOrder.mockResolvedValue(order);
      exchangeMock.fetchOpenOrders.mockImplementation(() => {
        return new Promise(resolve => setTimeout(() => resolve([order]), 100));
      });
      const cancelOrderSpy = vi.spyOn(exchangeMock, 'cancelOrder');
      const rotateProxySpy = vi.spyOn(binance, 'rotateProxy');
      const syncProxySpy = vi.spyOn(binance, 'syncProxy' as keyof Binance);

      const result = await binance.openLong({
        symbol: 'BTC/USDT',
        amount: 1,
        timeInForce: 500,
      });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toEqual({
        reason: 'TRADEKIT_ERROR',
        info: { code: 'TIME_OUT', msg: 'The order was not filled in time.' },
      });
      expect(cancelOrderSpy).toHaveBeenCalledWith(order.id);
      expect(rotateProxySpy).toHaveBeenCalled();
      expect(syncProxySpy).toHaveBeenCalled();
    });
  });

  describe('openShort', () => {
    it('should open short position and rotate proxy', async () => {
      const order = { id: '1' } as ccxt.Order;
      exchangeMock.createMarketOrder.mockResolvedValue(order);
      exchangeMock.fetchOpenOrders.mockResolvedValue([]);
      const rotateProxySpy = vi.spyOn(binance, 'rotateProxy');
      const syncProxySpy = vi.spyOn(binance, 'syncProxy' as keyof Binance);

      const result = await binance.openShort({ symbol: 'BTC/USDT', amount: 1 });

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual(order);
      expect(rotateProxySpy).toHaveBeenCalled();
      expect(syncProxySpy).toHaveBeenCalled();
    });

    it('should handle error and rotate proxy', async () => {
      const error = new Error('Test error');
      exchangeMock.createMarketOrder.mockRejectedValue(error);
      const rotateProxySpy = vi.spyOn(binance, 'rotateProxy');
      const syncProxySpy = vi.spyOn(binance, 'syncProxy' as keyof Binance);

      const result = await binance.openShort({ symbol: 'BTC/USDT', amount: 1 });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toEqual({
        message: 'error',
        details: 'Test error',
      });
      expect(rotateProxySpy).toHaveBeenCalled();
      expect(syncProxySpy).toHaveBeenCalled();
    });

    it('should return error if order is not filled and timeout', async () => {
      const order = { id: '1' } as ccxt.Order;
      exchangeMock.createMarketOrder.mockResolvedValue(order);
      exchangeMock.fetchOpenOrders.mockImplementation(() => {
        return new Promise(resolve => setTimeout(() => resolve([order]), 100));
      });
      const cancelOrderSpy = vi.spyOn(exchangeMock, 'cancelOrder');
      const rotateProxySpy = vi.spyOn(binance, 'rotateProxy');
      const syncProxySpy = vi.spyOn(binance, 'syncProxy' as keyof Binance);

      const result = await binance.openShort({
        symbol: 'BTC/USDT',
        amount: 1,
        timeInForce: 500,
      });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toEqual({
        reason: 'TRADEKIT_ERROR',
        info: { code: 'TIME_OUT', msg: 'The order was not filled in time.' },
      });
      expect(cancelOrderSpy).toHaveBeenCalledWith(order.id);
      expect(rotateProxySpy).toHaveBeenCalled();
      expect(syncProxySpy).toHaveBeenCalled();
    });
  });

  describe('closeLong', () => {
    it('should close long position and rotate proxy', async () => {
      const order = { id: '1' } as ccxt.Order;
      exchangeMock.createMarketOrder.mockResolvedValue(order);
      exchangeMock.fetchOpenOrders.mockResolvedValue([]);
      const rotateProxySpy = vi.spyOn(binance, 'rotateProxy');
      const syncProxySpy = vi.spyOn(binance, 'syncProxy' as keyof Binance);

      const result = await binance.closeLong({ symbol: 'BTC/USDT', amount: 1 });

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual(order);
      expect(rotateProxySpy).toHaveBeenCalled();
      expect(syncProxySpy).toHaveBeenCalled();
    });

    it('should handle error and rotate proxy', async () => {
      const error = new Error('Test error');
      exchangeMock.createMarketOrder.mockRejectedValue(error);
      const rotateProxySpy = vi.spyOn(binance, 'rotateProxy');
      const syncProxySpy = vi.spyOn(binance, 'syncProxy' as keyof Binance);

      const result = await binance.closeLong({ symbol: 'BTC/USDT', amount: 1 });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toEqual({
        message: 'error',
        details: 'Test error',
      });
      expect(rotateProxySpy).toHaveBeenCalled();
      expect(syncProxySpy).toHaveBeenCalled();
    });

    it('should return error if order is not filled and timeout', async () => {
      const order = { id: '1' } as ccxt.Order;
      exchangeMock.createMarketOrder.mockResolvedValue(order);
      exchangeMock.fetchOpenOrders.mockImplementation(() => {
        return new Promise(resolve => setTimeout(() => resolve([order]), 100));
      });
      const cancelOrderSpy = vi.spyOn(exchangeMock, 'cancelOrder');
      const rotateProxySpy = vi.spyOn(binance, 'rotateProxy');
      const syncProxySpy = vi.spyOn(binance, 'syncProxy' as keyof Binance);

      const result = await binance.closeLong({
        symbol: 'BTC/USDT',
        amount: 1,
        timeInForce: 500,
      });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toEqual({
        reason: 'TRADEKIT_ERROR',
        info: { code: 'TIME_OUT', msg: 'The order was not filled in time.' },
      });
      expect(cancelOrderSpy).toHaveBeenCalledWith(order.id);
      expect(rotateProxySpy).toHaveBeenCalled();
      expect(syncProxySpy).toHaveBeenCalled();
    });
  });

  describe('closeShort', () => {
    it('should close short position and rotate proxy', async () => {
      const order = { id: '1' } as ccxt.Order;
      exchangeMock.createMarketOrder.mockResolvedValue(order);
      exchangeMock.fetchOpenOrders.mockResolvedValue([]);
      const rotateProxySpy = vi.spyOn(binance, 'rotateProxy');
      const syncProxySpy = vi.spyOn(binance, 'syncProxy' as keyof Binance);

      const result = await binance.closeShort({
        symbol: 'BTC/USDT',
        amount: 1,
      });

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual(order);
      expect(rotateProxySpy).toHaveBeenCalled();
      expect(syncProxySpy).toHaveBeenCalled();
    });

    it('should handle error and rotate proxy', async () => {
      const error = new Error('Test error');
      exchangeMock.createMarketOrder.mockRejectedValue(error);
      const rotateProxySpy = vi.spyOn(binance, 'rotateProxy');
      const syncProxySpy = vi.spyOn(binance, 'syncProxy' as keyof Binance);

      const result = await binance.closeShort({
        symbol: 'BTC/USDT',
        amount: 1,
      });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toEqual({
        message: 'error',
        details: 'Test error',
      });
      expect(rotateProxySpy).toHaveBeenCalled();
      expect(syncProxySpy).toHaveBeenCalled();
    });

    it('should return error if order is not filled and timeout', async () => {
      const order = { id: '1' } as ccxt.Order;
      exchangeMock.createMarketOrder.mockResolvedValue(order);
      exchangeMock.fetchOpenOrders.mockImplementation(() => {
        return new Promise(resolve => setTimeout(() => resolve([order]), 100));
      });
      const cancelOrderSpy = vi.spyOn(exchangeMock, 'cancelOrder');
      const rotateProxySpy = vi.spyOn(binance, 'rotateProxy');
      const syncProxySpy = vi.spyOn(binance, 'syncProxy' as keyof Binance);

      const result = await binance.closeShort({
        symbol: 'BTC/USDT',
        amount: 1,
        timeInForce: 500,
      });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toEqual({
        reason: 'TRADEKIT_ERROR',
        info: { code: 'TIME_OUT', msg: 'The order was not filled in time.' },
      });
      expect(cancelOrderSpy).toHaveBeenCalledWith(order.id);
      expect(rotateProxySpy).toHaveBeenCalled();
      expect(syncProxySpy).toHaveBeenCalled();
    });
  });
});
