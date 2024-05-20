import { describe, it, expect, beforeAll } from 'vitest';
import { z } from 'zod';
import 'dotenv/config';

import { Bybit } from '../index';
import { ProxyOptions, ProxyProtocol } from '../../types/shared/proxy';

// Define schemas using zod
const TickerSchema = z.object({
  symbol: z.string(),
  timestamp: z.number().optional(),
  datetime: z.string().optional(),
  high: z.number().optional(),
  low: z.number().optional(),
  bid: z.number().optional(),
  bidVolume: z.number().optional(),
  ask: z.number().optional(),
  askVolume: z.number().optional(),
  vwap: z.number().optional(),
  open: z.number().optional(),
  close: z.number().optional(),
  last: z.number().optional(),
  previousClose: z.number().optional(),
  change: z.number().optional(),
  percentage: z.number().optional(),
  average: z.number().optional(),
  baseVolume: z.number().optional(),
  quoteVolume: z.number().optional(),
  info: z.object({}),
});

const BalanceSchema = z.object({
  free: z.record(z.number().optional()),
  used: z.record(z.number().optional()),
  total: z.record(z.number().optional()),
  debt: z.record(z.number().optional()),
  info: z.object({}),
  datetime: z.string().optional(),
});

const OrderSchema = z.object({
  id: z.string(),
  clientOrderId: z.string().optional(),
  timestamp: z.number().optional(),
  datetime: z.string().optional(),
  lastTradeTimestamp: z.number().optional(),
  lastUpdateTimestamp: z.number().optional(),
  status: z.string().optional(),
  symbol: z.string(),
  type: z.string().optional(),
  timeInForce: z.string().optional(),
  side: z.string().optional(),
  price: z.number().optional(),
  average: z.number().optional(),
  amount: z.number().optional(),
  filled: z.number().optional(),
  remaining: z.number().optional(),
  stopPrice: z.number().optional(),
  triggerPrice: z.number().optional(),
  takeProfitPrice: z.number().optional(),
  stopLossPrice: z.number().optional(),
  cost: z.number().optional(),
  reduceOnly: z.boolean().optional(),
  postOnly: z.boolean().optional(),
  fee: z
    .object({
      cost: z.number().optional(),
      currency: z.string().optional(),
    })
    .optional(),
  trades: z.array(z.object({})).optional(),
  info: z.object({}),
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
        // Validate result against TickerSchema
        TickerSchema.parse(result.value);
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
        // Validate each ticker against TickerSchema
        result.value.forEach(ticker => TickerSchema.parse(ticker));
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

  describe('getBalance', () => {
    it('should fetch account balance successfully', async () => {
      const result = await bybit.getBalance();
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        // Validate result against BalanceSchema
        BalanceSchema.parse(result.value);
      }
    });

    it('should filter account balance when symbols are provided', async () => {
      const result = await bybit.getBalance({ currencies: ['USDT'] });
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        // Validate filtered balance against BalanceSchema
        const balance = result.value;
        BalanceSchema.parse(balance);
        expect(Object.keys(balance.free)).toEqual(['USDT']);
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
        OrderSchema.parse(result.value);
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
        OrderSchema.parse(result.value);
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
      OrderSchema.parse(result._unsafeUnwrap());
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
        OrderSchema.parse(result.value);
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
