import { describe, it, expect, beforeAll } from 'vitest';
import { z } from 'zod';
import 'dotenv/config';

import { Binance } from '../index';
import { ProxyOptions, ProxyProtocol } from '../../types/shared/proxy';

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

const API_KEY = process.env.BINANCE_TESTNET_API_KEY;
const API_SECRET = process.env.BINANCE_TESTNET_API_SECRET;

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

const binance = new Binance({
  auth: {
    key: API_KEY,
    secret: API_SECRET,
  },
  sandbox: true, // Use sandbox mode
  proxies: [parseProxyUrl(process.env.PROXY_URL_1 as string)],
});

describe('Binance Class Integration Tests', () => {
  beforeAll(() => {
    // Any setup can be done here
  });

  describe('getTicker', () => {
    it('should fetch a ticker successfully', async () => {
      const symbol = 'BTC/USDT:USDT';
      const result = await binance.getTicker({ symbol });
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        // Validate result against TickerSchema
        tickerSchema.parse(result.value);
      }
    });

    it('should handle error when fetching a non-existent ticker', async () => {
      const symbol = 'NONEXISTENT/USDT:USDT';
      const result = await binance.getTicker({ symbol });
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
      const result = await binance.getTickers({ symbols });
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toHaveLength(symbols.length);
        // Validate each ticker against TickerSchema
        result.value.forEach(ticker => tickerSchema.parse(ticker));
      }
    });

    it('should handle error when fetching multiple non-existent tickers', async () => {
      const symbols = ['NONEXISTENT1/USDT:USDT', 'NONEXISTENT2/USDT:USDT'];
      const result = await binance.getTickers({ symbols });
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toHaveProperty('reason', 'TRADEKIT_ERROR');
        if (result.error.reason === 'TRADEKIT_ERROR') {
          expect(result.error.info).toHaveProperty('code', 'BAD_SYMBOL');
        }
      }
    });
  });

  describe('getBalance', () => {
    it('should fetch account balance successfully', async () => {
      const result = await binance.getBalance();
      const balance = result._unsafeUnwrap();
      expect(() => balanceSchema.parse(balance)).not.toThrow();
    });

    it('should filter account balance when symbols are provided', async () => {
      const result = await binance.getBalance({ currencies: ['USDT'] });
      // Validate filtered balance against BalanceSchema
      const balance = result._unsafeUnwrap();
      balanceSchema.parse(balance);
      expect(Object.keys(balance.currencies)).toEqual(['USDT']);
    });
  });

  describe('setLeverage', () => {
    it('should set leverage successfully', async () => {
      const leverage = 1;
      const symbol = 'BTC/USDT:USDT';
      const result = await binance.setLeverage({
        leverage,
        symbol,
      });
      await binance.setLeverage({
        leverage,
        symbol: 'ETH/USDT:USDT',
      });
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe(leverage);
      }
    });

    it('should return error when setting leverage for a non-existent symbol', async () => {
      const leverage = 1;
      const symbol = 'NONEXISTENT/USDT:USDT';
      const result = await binance.setLeverage({
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
      const result = await binance.setLeverage({
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
        symbol: 'BTC/USDT:USDT',
        amount: 0.01,
        timeInForce: 30000,
      };
      const result = await binance.openLong(opts);
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
      const result = await binance.openLong(opts);
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
        symbol: 'BTC/USDT:USDT',
        amount: 0.01,
        timeInForce: 30000,
      };
      const result = await binance.closeLong(opts);
      orderSchema.parse(result._unsafeUnwrap());
      expect(result.isOk()).toBe(true);
    });

    it('should raise error when closing with unsupported symbol', async () => {
      const opts = {
        symbol: 'NONEXISTENT/USDT:USDT',
        amount: 100,
        timeInForce: 30000,
      };
      const result = await binance.closeLong(opts);
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
        symbol: 'BTC/USDT:USDT',
        amount: 0.01,
        timeInForce: 30000,
      };
      // Close the position first
      await binance.closeLong(opts);
      // Try closing again
      const result = await binance.closeLong(opts);
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toHaveProperty('reason', 'TRADEKIT_ERROR');
        if (result.error.reason === 'TRADEKIT_ERROR') {
          expect(result.error.info).toHaveProperty('code', 'INVALID_ORDER');
        }
      }
    });
  });

  describe('openShort', () => {
    it('should open a short position successfully', async () => {
      const opts = {
        symbol: 'BTC/USDT:USDT',
        amount: 0.01,
        timeInForce: 30000,
      };
      const result = await binance.openShort(opts);
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
      const result = await binance.openShort(opts);
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toHaveProperty('reason', 'TRADEKIT_ERROR');
        if (result.error.reason === 'TRADEKIT_ERROR') {
          expect(result.error.info).toHaveProperty('code', 'BAD_SYMBOL');
        }
      }
    });
  });

  describe('closeShort', () => {
    it('should close a short position successfully', async () => {
      const opts = {
        symbol: 'BTC/USDT:USDT',
        amount: 0.01,
        timeInForce: 30000,
      };
      const result = await binance.closeShort(opts);
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
      const result = await binance.closeShort(opts);
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
        symbol: 'BTC/USDT:USDT',
        amount: 0.01,
        timeInForce: 30000,
      };
      // Close the position first
      await binance.closeShort(opts);
      // Try closing again
      const result = await binance.closeShort(opts);
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
