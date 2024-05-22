import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';
import { bybit, Ticker, Tickers, Balances, ExchangeError, Order } from 'ccxt';
import { ok } from 'neverthrow';

import { Bybit } from '../index';
import { TradekitOptions } from '../../types/shared';
import {
  SubscribeToTikerOptions,
  SubscribeToTikersOptions,
} from '../../types/shared/tickers';
import { ccxtBalanceAdapter } from '../../shared/adapters/balance';

// Mock the bybit class
vi.mock('ccxt', async () => {
  const originalModule = await vi.importActual('ccxt');
  return {
    ...originalModule,
    default: {
      ...(originalModule.default as any),
      bybit: vi.fn().mockImplementation(() => ({
        fetchTicker: vi.fn(),
        fetchTickers: vi.fn(),
        fetchBalance: vi.fn(),
        fetchClosedOrder: vi.fn(),
        setLeverage: vi.fn(),
        createMarketOrder: vi.fn(),
        fetchOpenOrders: vi.fn(),
        cancelOrder: vi.fn(),
        setSandboxMode: vi.fn(),
        options: {},
      })),
    },
  };
});

vi.mock('../errors.ts', () => ({
  handleError: vi.fn().mockImplementation((e: Error) => ({
    message: 'error',
    details: e.message,
  })),
}));

vi.mock('../../shared/adapters/ticker.ts', () => ({
  ccxtTickerAdapter: vi.fn().mockImplementation((tiker: Ticker) => ok(tiker)),
}));

vi.mock('../../shared/adapters/balance.ts', () => ({
  ccxtBalanceAdapter: vi
    .fn()
    .mockImplementation((balance: Balances) => balance),
}));

vi.mock('../../shared/adapters/order.ts', () => ({
  ccxtOrderAdapter: vi.fn().mockImplementation((order: Order) => ok(order)),
}));

vi.mock('../websoket.ts', () => ({
  BybitStreamClient: vi.fn(),
}));

describe('Bybit', () => {
  let bybit: Bybit;
  let exchangeMock: Mocked<bybit>;

  beforeEach(() => {
    const opts: TradekitOptions = {
      auth: { key: 'test', secret: 'test' },
      sandbox: true,
    };
    bybit = new Bybit(opts);
    exchangeMock = bybit['exchange'] as Mocked<bybit>;
  });

  describe('getTicker', () => {
    it('should fetch ticker and rotate proxy', async () => {
      exchangeMock.fetchTicker.mockResolvedValue({
        symbol: 'BTC/USDT:USDT',
      } as Ticker);
      const rotateProxySpy = vi.spyOn(bybit, 'rotateProxy');
      const syncProxySpy = vi.spyOn(bybit, 'syncProxy' as keyof Bybit);

      const result = await bybit.getTicker({ symbol: 'BTC/USDT:USDT' });

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual({ symbol: 'BTC/USDT:USDT' });
      expect(rotateProxySpy).toHaveBeenCalled();
      expect(syncProxySpy).toHaveBeenCalled();
    });

    it('should handle error and rotate proxy', async () => {
      const error = new Error('Test error');
      exchangeMock.fetchTicker.mockRejectedValue(error);
      const rotateProxySpy = vi.spyOn(bybit, 'rotateProxy');
      const syncProxySpy = vi.spyOn(bybit, 'syncProxy' as keyof Bybit);

      const result = await bybit.getTicker({ symbol: 'BTC/USDT' });

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
        'BTC/USDT': { symbol: 'BTC/USDT' } as Ticker,
        'ETH/USDT': { symbol: 'ETH/USDT' } as Ticker,
      } as Tickers);
      const rotateProxySpy = vi.spyOn(bybit, 'rotateProxy');
      const syncProxySpy = vi.spyOn(bybit, 'syncProxy' as keyof Bybit);

      const result = await bybit.getTickers({
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
      const rotateProxySpy = vi.spyOn(bybit, 'rotateProxy');
      const syncProxySpy = vi.spyOn(bybit, 'syncProxy' as keyof Bybit);

      const result = await bybit.getTickers({
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
        symbol: 'BTC/USDT:USDT',
        onUpdate: vi.fn(),
      };

      const result = bybit.subscribeToTicker(options);

      expect(result).toBeDefined();
    });
  });

  describe('subscribeToTickers', () => {
    it('should not be implemented', () => {
      const options: SubscribeToTikersOptions = {
        symbols: ['BTC/USDT'],
        onUpdate: vi.fn(),
      };

      const result = bybit.subscribeToTickers(options);

      expect(result).toBeDefined();
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
      } as unknown as Balances;
      exchangeMock.fetchBalance.mockResolvedValue(balance);
      const rotateProxySpy = vi.spyOn(bybit, 'rotateProxy');
      const syncProxySpy = vi.spyOn(bybit, 'syncProxy' as keyof Bybit);

      const result = await bybit.getBalance();

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual(balance);
      expect(rotateProxySpy).toHaveBeenCalled();
      expect(syncProxySpy).toHaveBeenCalled();
    });

    it('should handle error and rotate proxy', async () => {
      const error = new Error('Test error');
      exchangeMock.fetchBalance.mockRejectedValue(error);
      const rotateProxySpy = vi.spyOn(bybit, 'rotateProxy');
      const syncProxySpy = vi.spyOn(bybit, 'syncProxy' as keyof Bybit);

      const result = await bybit.getBalance();

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
        debt: {},
        info: {},
        datetime: '',
      } as unknown as Balances;
      exchangeMock.fetchBalance.mockResolvedValue(balance);
      const rotateProxySpy = vi.spyOn(bybit, 'rotateProxy');
      const syncProxySpy = vi.spyOn(bybit, 'syncProxy' as keyof Bybit);
      vi.mocked(ccxtBalanceAdapter).mockReturnValue({
        currencies: {
          BTC: { free: 1, used: 0.5, total: 1.5 },
          ETH: { free: 2, used: 1, total: 3 },
        },
        timestamp: 0,
        datetime: new Date(),
      });

      const result = await bybit.getBalance({ currencies: ['BTC'] });

      expect(result.isOk()).toBe(true);
      expect(Object.keys(result._unsafeUnwrap().currencies)).toEqual(['BTC']);
      expect(rotateProxySpy).toHaveBeenCalled();
      expect(syncProxySpy).toHaveBeenCalled();
    });
  });

  describe('setLeverage', () => {
    it('should set leverage and rotate proxy', async () => {
      exchangeMock.setLeverage.mockResolvedValue(undefined);
      const rotateProxySpy = vi.spyOn(bybit, 'rotateProxy');
      const syncProxySpy = vi.spyOn(bybit, 'syncProxy' as keyof Bybit);

      const result = await bybit.setLeverage({
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
      const rotateProxySpy = vi.spyOn(bybit, 'rotateProxy');
      const syncProxySpy = vi.spyOn(bybit, 'syncProxy' as keyof Bybit);

      const result = await bybit.setLeverage({
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
      const error = new ExchangeError('bybit {"retCode":110043}');
      exchangeMock.setLeverage.mockRejectedValue(error);
      const rotateProxySpy = vi.spyOn(bybit, 'rotateProxy');
      const syncProxySpy = vi.spyOn(bybit, 'syncProxy' as keyof Bybit);

      const result = await bybit.setLeverage({
        leverage: 10,
        symbol: 'BTC/USDT',
      });

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual(10);
      expect(rotateProxySpy).toHaveBeenCalled();
      expect(syncProxySpy).toHaveBeenCalled();
    });

    it('should return err if exchange return other error', async () => {
      const error = new ExchangeError('bybit {"retCode":42}');
      exchangeMock.setLeverage.mockRejectedValue(error);
      const rotateProxySpy = vi.spyOn(bybit, 'rotateProxy');
      const syncProxySpy = vi.spyOn(bybit, 'syncProxy' as keyof Bybit);

      const result = await bybit.setLeverage({
        leverage: 10,
        symbol: 'BTC/USDT',
      });

      expect(result.isErr()).toBe(true);
      expect(rotateProxySpy).toHaveBeenCalled();
      expect(syncProxySpy).toHaveBeenCalled();
    });

    it('should return err if symbol is unset', async () => {
      const rotateProxySpy = vi.spyOn(bybit, 'rotateProxy');
      const syncProxySpy = vi.spyOn(bybit, 'syncProxy' as keyof Bybit);

      const result = await bybit.setLeverage({
        leverage: 10,
        symbol: undefined,
      });

      expect(result.isErr()).toBe(true);
      expect(rotateProxySpy).toHaveBeenCalled();
      expect(syncProxySpy).toHaveBeenCalled();
    });
  });

  describe('openLong', () => {
    it('should open long position and rotate proxy', async () => {
      const order = { id: '1' } as Order;
      exchangeMock.createMarketOrder.mockResolvedValue(order);
      exchangeMock.fetchOpenOrders.mockResolvedValue([]);
      exchangeMock.fetchClosedOrder.mockResolvedValue(order);
      const rotateProxySpy = vi.spyOn(bybit, 'rotateProxy');
      const syncProxySpy = vi.spyOn(bybit, 'syncProxy' as keyof Bybit);

      const result = await bybit.openLong({ symbol: 'BTC/USDT', amount: 1 });

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual(order);
      expect(rotateProxySpy).toHaveBeenCalled();
      expect(syncProxySpy).toHaveBeenCalled();
    });

    it('should handle error and rotate proxy', async () => {
      const error = new Error('Test error');
      exchangeMock.createMarketOrder.mockRejectedValue(error);
      const rotateProxySpy = vi.spyOn(bybit, 'rotateProxy');
      const syncProxySpy = vi.spyOn(bybit, 'syncProxy' as keyof Bybit);

      const result = await bybit.openLong({ symbol: 'BTC/USDT', amount: 1 });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toEqual({
        message: 'error',
        details: 'Test error',
      });
      expect(rotateProxySpy).toHaveBeenCalled();
      expect(syncProxySpy).toHaveBeenCalled();
    });

    it('should return error if order is not filled and timeout', async () => {
      const order = { id: '1' } as Order;
      exchangeMock.createMarketOrder.mockResolvedValue(order);
      exchangeMock.fetchOpenOrders.mockImplementation(() => {
        return new Promise(resolve => setTimeout(() => resolve([order]), 100));
      });
      const cancelOrderSpy = vi.spyOn(exchangeMock, 'cancelOrder');
      const rotateProxySpy = vi.spyOn(bybit, 'rotateProxy');
      const syncProxySpy = vi.spyOn(bybit, 'syncProxy' as keyof Bybit);

      const result = await bybit.openLong({
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
      const order = { id: '1' } as Order;
      exchangeMock.createMarketOrder.mockResolvedValue(order);
      exchangeMock.fetchOpenOrders.mockResolvedValue([]);
      exchangeMock.fetchClosedOrder.mockResolvedValue(order);
      const rotateProxySpy = vi.spyOn(bybit, 'rotateProxy');
      const syncProxySpy = vi.spyOn(bybit, 'syncProxy' as keyof Bybit);

      const result = await bybit.openShort({ symbol: 'BTC/USDT', amount: 1 });

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual(order);
      expect(rotateProxySpy).toHaveBeenCalled();
      expect(syncProxySpy).toHaveBeenCalled();
    });

    it('should handle error and rotate proxy', async () => {
      const error = new Error('Test error');
      exchangeMock.createMarketOrder.mockRejectedValue(error);
      const rotateProxySpy = vi.spyOn(bybit, 'rotateProxy');
      const syncProxySpy = vi.spyOn(bybit, 'syncProxy' as keyof Bybit);

      const result = await bybit.openShort({ symbol: 'BTC/USDT', amount: 1 });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toEqual({
        message: 'error',
        details: 'Test error',
      });
      expect(rotateProxySpy).toHaveBeenCalled();
      expect(syncProxySpy).toHaveBeenCalled();
    });

    it('should return error if order is not filled and timeout', async () => {
      const order = { id: '1' } as Order;
      exchangeMock.createMarketOrder.mockResolvedValue(order);
      exchangeMock.fetchOpenOrders.mockImplementation(() => {
        return new Promise(resolve => setTimeout(() => resolve([order]), 100));
      });
      const cancelOrderSpy = vi.spyOn(exchangeMock, 'cancelOrder');
      const rotateProxySpy = vi.spyOn(bybit, 'rotateProxy');
      const syncProxySpy = vi.spyOn(bybit, 'syncProxy' as keyof Bybit);

      const result = await bybit.openShort({
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
      const order = { id: '1' } as Order;
      exchangeMock.createMarketOrder.mockResolvedValue(order);
      exchangeMock.fetchOpenOrders.mockResolvedValue([]);
      exchangeMock.fetchClosedOrder.mockResolvedValue(order);
      const rotateProxySpy = vi.spyOn(bybit, 'rotateProxy');
      const syncProxySpy = vi.spyOn(bybit, 'syncProxy' as keyof Bybit);

      const result = await bybit.closeLong({ symbol: 'BTC/USDT', amount: 1 });

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual(order);
      expect(rotateProxySpy).toHaveBeenCalled();
      expect(syncProxySpy).toHaveBeenCalled();
    });

    it('should handle error and rotate proxy', async () => {
      const error = new Error('Test error');
      exchangeMock.createMarketOrder.mockRejectedValue(error);
      const rotateProxySpy = vi.spyOn(bybit, 'rotateProxy');
      const syncProxySpy = vi.spyOn(bybit, 'syncProxy' as keyof Bybit);

      const result = await bybit.closeLong({ symbol: 'BTC/USDT', amount: 1 });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toEqual({
        message: 'error',
        details: 'Test error',
      });
      expect(rotateProxySpy).toHaveBeenCalled();
      expect(syncProxySpy).toHaveBeenCalled();
    });

    it('should return error if order is not filled and timeout', async () => {
      const order = { id: '1' } as Order;
      exchangeMock.createMarketOrder.mockResolvedValue(order);
      exchangeMock.fetchOpenOrders.mockImplementation(() => {
        return new Promise(resolve => setTimeout(() => resolve([order]), 100));
      });
      const cancelOrderSpy = vi.spyOn(exchangeMock, 'cancelOrder');
      const rotateProxySpy = vi.spyOn(bybit, 'rotateProxy');
      const syncProxySpy = vi.spyOn(bybit, 'syncProxy' as keyof Bybit);

      const result = await bybit.closeLong({
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
      const order = { id: '1' } as Order;
      exchangeMock.createMarketOrder.mockResolvedValue(order);
      exchangeMock.fetchOpenOrders.mockResolvedValue([]);
      exchangeMock.fetchClosedOrder.mockResolvedValue(order);
      const rotateProxySpy = vi.spyOn(bybit, 'rotateProxy');
      const syncProxySpy = vi.spyOn(bybit, 'syncProxy' as keyof Bybit);

      const result = await bybit.closeShort({ symbol: 'BTC/USDT', amount: 1 });

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual(order);
      expect(rotateProxySpy).toHaveBeenCalled();
      expect(syncProxySpy).toHaveBeenCalled();
    });

    it('should handle error and rotate proxy', async () => {
      const error = new Error('Test error');
      exchangeMock.createMarketOrder.mockRejectedValue(error);
      const rotateProxySpy = vi.spyOn(bybit, 'rotateProxy');
      const syncProxySpy = vi.spyOn(bybit, 'syncProxy' as keyof Bybit);

      const result = await bybit.closeShort({ symbol: 'BTC/USDT', amount: 1 });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toEqual({
        message: 'error',
        details: 'Test error',
      });
      expect(rotateProxySpy).toHaveBeenCalled();
      expect(syncProxySpy).toHaveBeenCalled();
    });

    it('should return error if order is not filled and timeout', async () => {
      const order = { id: '1' } as Order;
      exchangeMock.createMarketOrder.mockResolvedValue(order);
      exchangeMock.fetchOpenOrders.mockImplementation(() => {
        return new Promise(resolve => setTimeout(() => resolve([order]), 100));
      });
      const cancelOrderSpy = vi.spyOn(exchangeMock, 'cancelOrder');
      const rotateProxySpy = vi.spyOn(bybit, 'rotateProxy');
      const syncProxySpy = vi.spyOn(bybit, 'syncProxy' as keyof Bybit);

      const result = await bybit.closeShort({
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
