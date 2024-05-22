import { describe, it, expect } from 'vitest';
import { Balances as CCXTBalance } from 'ccxt';

import { ccxtBalanceAdapter } from '../balance';

describe('ccxtBalanceAdapter', () => {
  it('should convert empty balances correctly', () => {
    const ccxtBalances: CCXTBalance = {
      info: { free: 0, used: 0, total: 0 },
    };

    const result = ccxtBalanceAdapter(ccxtBalances);

    expect(result.currencies).toEqual({});
    expect(result.timestamp).toBeCloseTo(new Date().getTime(), -2);
    expect(result.datetime.getTime()).toBeCloseTo(new Date().getTime(), -2);
  });

  it('should convert balances with one currency correctly', () => {
    const ccxtBalances: CCXTBalance = {
      BTC: { free: 1, used: 0.5, total: 1.5 },
      info: { free: 0, used: 0, total: 0 },
    };

    const expectedCurrencies = {
      BTC: { free: 1, used: 0.5, total: 1.5 },
    };

    const result = ccxtBalanceAdapter(ccxtBalances);

    expect(result.currencies).toEqual(expectedCurrencies);
    expect(result.timestamp).toBeCloseTo(new Date().getTime(), -2);
    expect(result.datetime.getTime()).toBeCloseTo(new Date().getTime(), -2);
  });

  it('should convert balances with multiple currencies correctly', () => {
    const ccxtBalances: CCXTBalance = {
      BTC: { free: 1, used: 0.5, total: 1.5 },
      ETH: { free: 2, used: 1, total: 3 },
      info: { free: 0, used: 0, total: 0 },
    };

    const expectedCurrencies = {
      BTC: { free: 1, used: 0.5, total: 1.5 },
      ETH: { free: 2, used: 1, total: 3 },
    };

    const result = ccxtBalanceAdapter(ccxtBalances);

    expect(result.currencies).toEqual(expectedCurrencies);
    expect(result.timestamp).toBeCloseTo(new Date().getTime(), -2);
    expect(result.datetime.getTime()).toBeCloseTo(new Date().getTime(), -2);
  });

  it('should ignore irrelevant keys', () => {
    const ccxtBalances: CCXTBalance = {
      BTC: { free: 1, used: 0.5, total: 1.5 },
      info: { free: 0, used: 0, total: 0 },
    };

    const expectedCurrencies = {
      BTC: { free: 1, used: 0.5, total: 1.5 },
    };

    const result = ccxtBalanceAdapter(ccxtBalances);

    expect(result.currencies).toEqual(expectedCurrencies);
    expect(result.timestamp).toBeCloseTo(new Date().getTime(), -2);
    expect(result.datetime.getTime()).toBeCloseTo(new Date().getTime(), -2);
  });

  it('should handle missing balance values gracefully', () => {
    const ccxtBalances: CCXTBalance = {
      BTC: { free: 1, used: undefined, total: 1.5 },
      ETH: { free: undefined, used: 1, total: 3 },
      DOGE: { free: 3, used: 1, total: undefined },
      info: { free: 0, used: 0, total: 0 },
    };

    const expectedCurrencies = {
      BTC: { free: 1, used: 0, total: 1.5 },
      ETH: { free: 0, used: 1, total: 3 },
      DOGE: { free: 3, used: 1, total: 0 },
    };

    const result = ccxtBalanceAdapter(ccxtBalances);

    expect(result.currencies).toEqual(expectedCurrencies);
    expect(result.timestamp).toBeCloseTo(new Date().getTime(), -2);
    expect(result.datetime.getTime()).toBeCloseTo(new Date().getTime(), -2);
  });
});
