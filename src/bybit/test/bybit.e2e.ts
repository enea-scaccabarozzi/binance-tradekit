import { describe, it, expect, beforeAll, vi } from 'vitest';
import { z } from 'zod';
import 'dotenv/config';

import { Bybit } from '../index';
import { ProxyOptions, ProxyProtocol } from '../../types/shared/proxy';

// Define schemas using zod
const tickerSchema = z.object({
  symbol: z.string(),
  timestamp: z.number(),
  datetime: z.date(),
  last: z.number(),
  close: z.number(),
  absChange: z.number(),
  percChange: z.number(),
  high: z.number(),
  low: z.number(),
  volume: z.number(),
  baseVolume: z.number(),
  quoteVolume: z.number(),
  open: z.number(),
  openTime: z.date(),
  info: z.any(),
});

const currencyBalanceSchema = z.object({
  free: z.number(),
  used: z.number(),
  total: z.number(),
});

const balanceSchema = z.object({
  currencies: z.record(currencyBalanceSchema),
  timestamp: z.number(),
  datetime: z.date(),
});

const orderSchema = z.object({
  orderId: z.string(),
  symbol: z.string(),
  price: z.number(),
  quantity: z.number(),
  orderType: z.enum(['market', 'limit', 'stop', 'stop-limit']),
  side: z.enum(['buy', 'sell']),
  status: z.enum(['new', 'filled', 'canceled']),
  timestamp: z.number(),
  datetime: z.date(),
  clientOrderId: z.string().optional(),
});

const API_KEY = process.env.BYBIT_TESTNET_API_KEY;
const API_SECRET = process.env.BYBIT_TESTNET_API_SECRET;

// Check if API_KEY and API_SECRET are set
if (!API_KEY || !API_SECRET) {
  throw new Error(
    'Please set TESTNET_API_KEY and TESTNET_API_SECRET in .env file'
  );
}

const parseProxyUrl = (url: string): ProxyOptions => {
  const parsedUrl = new URL(url);
  return {
    protocol: parsedUrl.protocol.slice(0, -1) as ProxyProtocol,
    host: parsedUrl.hostname,
    port: Number(parsedUrl.port),
    auth: {
      username: parsedUrl.username,
      password: parsedUrl.password,
    },
  };
};

const bybit = new Bybit({
  auth: {
    key: API_KEY,
    secret: API_SECRET,
  },
  sandbox: true, // Use sandbox mode
  proxies: [parseProxyUrl(process.env.PROXY_URL_1 as string)],
});

describe('Bybit Class Integration Tests', () => {
  beforeAll(() => {
    // Any setup can be done here
  });

  describe('getTicker', () => {
    it('should fetch a ticker successfully', async () => {
      const symbol = 'BTC/USDT';
      const result = await bybit.getTicker({ symbol });
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        // Validate result against tickerSchema
        tickerSchema.parse(result.value);
      }
    });

    it('should handle error when fetching a non-existent ticker', async () => {
      const symbol = 'NONEXISTENT/USDT:USDT';
      const result = await bybit.getTicker({ symbol });
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toHaveProperty('reason', 'TRADEKIT_ERROR');
        if (result.error.reason === 'TRADEKIT_ERROR') {
          expect(result.error.info).toHaveProperty('code', 'BAD_SYMBOL');
        }
      }
    });
  });

  describe('getTickers', () => {
    it('should fetch multiple tickers successfully', async () => {
      const symbols = ['BTC/USDT:USDT', 'ETH/USDT:USDT'];
      const result = await bybit.getTickers({ symbols });
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toHaveLength(symbols.length);
        // Validate each ticker against tickerSchema
        result.value.forEach(ticker => tickerSchema.parse(ticker));
      }
    });

    it('should handle error when fetching multiple non-existent tickers', async () => {
      const symbols = ['NONEXISTENT1/USDT:USDT', 'NONEXISTENT2/USDT:USDT'];
      const result = await bybit.getTickers({ symbols });
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toHaveProperty('reason', 'TRADEKIT_ERROR');
        if (result.error.reason === 'TRADEKIT_ERROR') {
          expect(result.error.info).toHaveProperty('code', 'BAD_SYMBOL');
        }
      }
    });
  });

  describe('subscribeToTicker', () => {
    it('should retrive ticker events successfully', async () => {
      const symbol = 'BTC/USDT:USDT';
      const onUpdate = vi.fn();
      const onClose = vi.fn();
      const onSubscription = vi.fn();
      const onError = vi.fn();
      const opts = {
        symbol,
        onUpdate,
        onClose,
        onSubscription,
        onError,
      };
      const result = bybit.subscribeToTicker(opts);
      expect(result).toBeDefined();
      await new Promise(resolve => setTimeout(resolve, 2500));
      expect(onUpdate).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const ticker = onUpdate.mock.calls[0][0];
      tickerSchema.parse(ticker);
      expect(onSubscription).toBeCalledTimes(1);
      result.close();
      await new Promise(resolve => setTimeout(resolve, 500));
      expect(onClose).toBeCalledTimes(1);
      expect(onError).not.toBeCalled();
    });

    it('should handle error when subcribing to non-existent tickers', async () => {
      const symbol = 'NONEXISTING/USDT:USDT';
      const onUpdate = vi.fn();
      const onClose = vi.fn();
      const onSubscription = vi.fn();
      const onError = vi.fn();
      const opts = {
        symbol,
        onUpdate,
        onClose,
        onSubscription,
        onError,
      };
      const result = bybit.subscribeToTicker(opts);
      expect(result).toBeDefined();
      await new Promise(resolve => setTimeout(resolve, 2500));
      expect(onSubscription).toBeCalledTimes(1);
      expect(onError).toBeCalled();
      result.close();
      await new Promise(resolve => setTimeout(resolve, 500));
      expect(onClose).toBeCalledTimes(1);
      expect(onUpdate).not.toBeCalled();
    });
  });

  describe('subscribeToTickers', () => {
    it('should retrive tickers events successfully', async () => {
      const symbols = ['BTC/USDT:USDT', 'ETH/USDT:USDT'];
      const onUpdate = vi.fn();
      const onClose = vi.fn();
      const onSubscription = vi.fn();
      const onError = vi.fn();
      const opts = {
        symbols,
        onUpdate,
        onClose,
        onSubscription,
        onError,
      };
      const result = bybit.subscribeToTickers(opts);
      expect(result).toBeDefined();
      await new Promise(resolve => setTimeout(resolve, 2500));
      expect(onUpdate).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const ticker = onUpdate.mock.calls[0][0];
      tickerSchema.parse(ticker);
      expect(onSubscription).toBeCalledTimes(1);
      result.close();
      await new Promise(resolve => setTimeout(resolve, 500));
      expect(onClose).toBeCalledTimes(1);
      expect(onError).not.toBeCalled();
    });

    it('should handle error when subcribing to non-existent tickers', async () => {
      const symbols = ['NONEXISTING/USDT:USDT', 'NONEXISTING2/USDT:USDT'];
      const onUpdate = vi.fn();
      const onClose = vi.fn();
      const onSubscription = vi.fn();
      const onError = vi.fn();
      const opts = {
        symbols,
        onUpdate,
        onClose,
        onSubscription,
        onError,
      };
      const result = bybit.subscribeToTickers(opts);
      expect(result).toBeDefined();
      await new Promise(resolve => setTimeout(resolve, 2500));
      expect(onSubscription).toBeCalledTimes(1);
      expect(onError).toBeCalled();
      result.close();
      await new Promise(resolve => setTimeout(resolve, 500));
      expect(onClose).toBeCalledTimes(1);
      expect(onUpdate).not.toBeCalled();
    });
  });

  describe('getBalance', () => {
    it('should fetch account balance successfully', async () => {
      const result = await bybit.getBalance();
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        // Validate result against BalanceSchema
        balanceSchema.parse(result.value);
      }
    });

    it('should filter account balance when symbols are provided', async () => {
      const result = await bybit.getBalance({ currencies: ['USDT'] });
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        // Validate filtered balance against BalanceSchema
        const balance = result.value;
        balanceSchema.parse(balance);
        expect(Object.keys(balance.currencies)).toEqual(['USDT']);
      }
    });
  });

  describe('setLeverage', () => {
    it('should set leverage successfully', async () => {
      const leverage = 1;
      const symbol = 'BTC/USDT:USDT';
      const result = await bybit.setLeverage({
        leverage,
        symbol,
      });
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe(leverage);
      }
    });

    it('should return error when setting leverage for a non-existent symbol', async () => {
      const leverage = 1;
      const symbol = 'NONEXISTENT/USDT:USDT';
      const result = await bybit.setLeverage({
        leverage,
        symbol,
      });
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toHaveProperty('reason', 'TRADEKIT_ERROR');
        if (result.error.reason === 'TRADEKIT_ERROR') {
          expect(result.error.info).toHaveProperty('code', 'BAD_SYMBOL');
        }
      }
    });

    it('should return error when setting leverage with undefined symbol', async () => {
      const leverage = 1;
      const result = await bybit.setLeverage({
        leverage,
        symbol: undefined,
      });
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toHaveProperty('reason', 'TRADEKIT_ERROR');
        if (result.error.reason === 'TRADEKIT_ERROR') {
          expect(result.error.info).toHaveProperty('code', 'BAD_SYMBOL');
        }
      }
    });
  });

  describe('openLong', () => {
    it('should open a long position successfully', async () => {
      const opts = {
        symbol: 'DOGE/USDT:USDT',
        amount: 100,
        timeInForce: 30000,
      };
      const result = await bybit.openLong(opts);
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        // Validate result against OrderSchema
        orderSchema.parse(result.value);
      }
    });

    it('should handle error when opening with unsupported symbol', async () => {
      const opts = {
        symbol: 'NONEXISTENT/USDT:USDT',
        amount: 1,
        timeInForce: 30000,
      };
      const result = await bybit.openLong(opts);
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toHaveProperty('reason', 'TRADEKIT_ERROR');
        if (result.error.reason === 'TRADEKIT_ERROR') {
          expect(result.error.info).toHaveProperty('code', 'BAD_SYMBOL');
        }
      }
    });
  });

  describe('openShort', () => {
    it('should open a short position successfully', async () => {
      const opts = {
        symbol: 'XRP/USDT:USDT',
        amount: 100,
        timeInForce: 30000,
      };
      const result = await bybit.openShort(opts);
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        // Validate result against OrderSchema
        orderSchema.parse(result.value);
      }
    });

    it('should handle error when opening with unsupported symbol', async () => {
      const opts = {
        symbol: 'NONEXISTENT/USDT:USDT',
        amount: 100,
        timeInForce: 30000,
      };
      const result = await bybit.openShort(opts);
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toHaveProperty('reason', 'TRADEKIT_ERROR');
        if (result.error.reason === 'TRADEKIT_ERROR') {
          expect(result.error.info).toHaveProperty('code', 'BAD_SYMBOL');
        }
      }
    });
  });

  describe('closeLong', () => {
    it('should close a long position successfully', async () => {
      const opts = {
        symbol: 'DOGE/USDT:USDT',
        amount: 100,
        timeInForce: 30000,
      };
      const result = await bybit.closeLong(opts);
      orderSchema.parse(result._unsafeUnwrap());
      expect(result.isOk()).toBe(true);
    });

    it('should raise error when closing with unsupported symbol', async () => {
      const opts = {
        symbol: 'NONEXISTENT/USDT:USDT',
        amount: 100,
        timeInForce: 30000,
      };
      const result = await bybit.closeLong(opts);
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toHaveProperty('reason', 'TRADEKIT_ERROR');
        if (result.error.reason === 'TRADEKIT_ERROR') {
          expect(result.error.info).toHaveProperty('code', 'BAD_SYMBOL');
        }
      }
    });

    it('should raise error when attempting to close a position already closed', async () => {
      const opts = {
        symbol: 'DOGE/USDT:USDT',
        amount: 100,
        timeInForce: 30000,
      };
      // Close the position first
      await bybit.closeLong(opts);
      // Try closing again
      const result = await bybit.closeLong(opts);
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toHaveProperty('reason', 'TRADEKIT_ERROR');
        if (result.error.reason === 'TRADEKIT_ERROR') {
          expect(result.error.info).toHaveProperty('code', 'INVALID_ORDER');
        }
      }
    });
  });

  describe('closeShort', () => {
    it('should close a short position successfully', async () => {
      const opts = {
        symbol: 'XRP/USDT:USDT',
        amount: 100,
        timeInForce: 30000,
      };
      const result = await bybit.closeShort(opts);
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        // Validate result against OrderSchema
        orderSchema.parse(result.value);
      }
    });

    it('should raise error when closing with unsupported symbol', async () => {
      const opts = {
        symbol: 'NONEXISTENT/USDT:USDT',
        amount: 100,
        timeInForce: 30000,
      };
      const result = await bybit.closeShort(opts);
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toHaveProperty('reason', 'TRADEKIT_ERROR');
        if (result.error.reason === 'TRADEKIT_ERROR') {
          expect(result.error.info).toHaveProperty('code', 'BAD_SYMBOL');
        }
      }
    });

    it('should raise error when attempting to close a position already closed', async () => {
      const opts = {
        symbol: 'XRP/USDT:USDT',
        amount: 100,
        timeInForce: 30000,
      };
      // Close the position first
      await bybit.closeShort(opts);
      // Try closing again
      const result = await bybit.closeShort(opts);
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toHaveProperty('reason', 'TRADEKIT_ERROR');
        if (result.error.reason === 'TRADEKIT_ERROR') {
          expect(result.error.info).toHaveProperty('code', 'INVALID_ORDER');
        }
      }
    });
  });
});
