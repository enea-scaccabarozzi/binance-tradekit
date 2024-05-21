import { describe, it, expect } from 'vitest';
import * as ccxt from 'ccxt';

import { handleError } from '../errors';
import { TradekitError } from '../../types/shared/errors';

describe('handleError', () => {
  it('should return RATE_LIMIT for ccxt.RateLimitExceeded', () => {
    const error = new ccxt.RateLimitExceeded('Rate limit exceeded');
    const result = handleError(error);
    expect(result).toEqual<TradekitError>({ reason: 'RATE_LIMIT' });
  });

  it('should return NETWORK_ERROR for ccxt.NetworkError', () => {
    const error = new ccxt.NetworkError('Network error occurred');
    const result = handleError(error);
    expect(result).toEqual<TradekitError>({
      reason: 'NETWORK_ERROR',
      info: { msg: 'Network error occurred' },
    });
  });

  it('should return EXCHANGE_ERROR for ccxt.ExchangeError with binance prefix', () => {
    const error = new ccxt.ExchangeError(
      'binance {"code":10001,"msg":"Invalid API key"}'
    );
    const result = handleError(error);
    expect(result).toEqual<TradekitError>({
      reason: 'EXCHANGE_ERROR',
      info: {
        exchange: 'binance',
        code: '10001',
        msg: 'Invalid API key',
      },
    });
  });

  it('should return TRADEKIT_ERROR for ccxt.BadSymbol', () => {
    const error = new ccxt.BadSymbol('Bad symbol error');
    const result = handleError(error);
    expect(result).toEqual<TradekitError>({
      reason: 'TRADEKIT_ERROR',
      info: {
        code: 'BAD_SYMBOL',
        msg: 'Bad symbol error',
      },
    });
  });

  it('should return TRADEKIT_ERROR for ccxt.InvalidOrder', () => {
    const error = new ccxt.InvalidOrder('Invalid order error');
    const result = handleError(error);
    expect(result).toEqual<TradekitError>({
      reason: 'TRADEKIT_ERROR',
      info: {
        code: 'INVALID_ORDER',
        msg: 'Invalid order error',
      },
    });
  });

  it('should return TRADEKIT_ERROR for binance with specific code -2022', () => {
    const error = new ccxt.ExchangeError(
      'binance {"code":-2022,"msg":"Order would immediately trigger"}'
    );
    const result = handleError(error);
    expect(result).toEqual<TradekitError>({
      reason: 'TRADEKIT_ERROR',
      info: {
        code: 'INVALID_ORDER',
        msg: 'Order would immediately trigger',
      },
    });
  });

  it('should return CCXT_ERROR for ccxt.BaseError', () => {
    const error = new ccxt.BaseError('Base error occurred');
    const result = handleError(error);
    expect(result).toEqual<TradekitError>({
      reason: 'CCXT_ERROR',
      info: {
        code: 'BASE_ERROR',
        msg: 'Base error occurred',
        original: error,
      },
    });
  });

  it('should return UNKNOWN_ERROR for general Error', () => {
    const error = new Error('Some general error');
    const result = handleError(error);
    expect(result).toEqual<TradekitError>({
      reason: 'UNKNOWN_ERROR',
      info: {
        msg: 'ERROR',
        code: 'UNKNOWN',
      },
    });
  });

  it('should return UNKNOWN_ERROR for unknown error type', () => {
    const error = { unexpected: 'error' };
    const result = handleError(error);
    expect(result).toEqual<TradekitError>({
      reason: 'UNKNOWN_ERROR',
      info: {
        msg: 'If you see this error you have successfully broken my code. Congratulations!',
        code: 'GOOD_JOB',
      },
    });
  });
});
