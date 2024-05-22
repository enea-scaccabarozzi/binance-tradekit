import { describe, it, expect } from 'vitest';
import { normalizeSymbol } from '../utils';

describe('normalizeSymbol', () => {
  it('should normalize symbol without sandbox', () => {
    const result = normalizeSymbol('BTC/USD:USD', false);
    expect(result).toBe('BTCUSD');
  });

  it('should normalize symbol with sandbox', () => {
    const result = normalizeSymbol('BTC/USD:USD', true);
    expect(result).toBe('SBTCSUSD');
  });

  it('should handle symbols with different base currencies without sandbox', () => {
    const result = normalizeSymbol('ETH/EUR:EUR', false);
    expect(result).toBe('ETHEUR');
  });

  it('should handle symbols with different base currencies with sandbox', () => {
    const result = normalizeSymbol('ETH/EUR:EUR', true);
    expect(result).toBe('SETHSEUR');
  });

  it('should handle symbols with no colon without sandbox', () => {
    const result = normalizeSymbol('LTC/GBP', false);
    expect(result).toBe('LTCGBP');
  });

  it('should handle symbols with no colon with sandbox', () => {
    const result = normalizeSymbol('LTC/GBP', true);
    expect(result).toBe('SLTCSGBP');
  });

  it('should handle symbols with complex formats without sandbox', () => {
    const result = normalizeSymbol('BNB/USDT:USD', false);
    expect(result).toBe('BNBUSDT');
  });

  it('should handle symbols with complex formats with sandbox', () => {
    const result = normalizeSymbol('BNB/USDT:USD', true);
    expect(result).toBe('SBNBSUSDT');
  });

  it('should handle single pair symbols without sandbox', () => {
    const result = normalizeSymbol('BTC/USD', false);
    expect(result).toBe('BTCUSD');
  });

  it('should handle single pair symbols with sandbox', () => {
    const result = normalizeSymbol('BTC/USD', true);
    expect(result).toBe('SBTCSUSD');
  });
});
