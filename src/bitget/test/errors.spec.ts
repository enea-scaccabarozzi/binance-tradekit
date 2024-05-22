import { describe, it, expect } from 'vitest';
import {
  RateLimitExceeded,
  NetworkError,
  ExchangeError,
  BadSymbol,
  BaseError,
} from 'ccxt';

import { handleError } from '../errors';
import { TradekitError } from '../../types/shared/errors';

describe('handleError', () => {
  it('should return RATE_LIMIT for RateLimitExceeded', () => {
    const error = new RateLimitExceeded('Rate limit exceeded');
    const result = handleError(error);
    expect(result).toEqual<TradekitError>({ reason: 'RATE_LIMIT' });
  });

  it('should return NETWORK_ERROR for NetworkError', () => {
    const error = new NetworkError('Network error occurred');
    const result = handleError(error);
    expect(result).toEqual<TradekitError>({
      reason: 'NETWORK_ERROR',
      info: { msg: 'Network error occurred' },
    });
  });

  it('should return EXCHANGE_ERROR for ExchangeError with bitget prefix', () => {
    const error = new ExchangeError(
      'bitget {"code":"10001","msg":"Invalid API key"}'
    );
    const result = handleError(error);
    expect(result).toEqual<TradekitError>({
      reason: 'EXCHANGE_ERROR',
      info: {
        exchange: 'bitget',
        code: '10001',
        msg: 'Invalid API key',
      },
    });
  });

  it('should return TRADEKIT_ERROR for BadSymbol', () => {
    const error = new BadSymbol('Bad symbol error');
    const result = handleError(error);
    expect(result).toEqual<TradekitError>({
      reason: 'TRADEKIT_ERROR',
      info: {
        code: 'BAD_SYMBOL',
        msg: 'Bad symbol error',
      },
    });
  });

  it('should return TRADEKIT_ERROR for bitget code 40034', () => {
    const error = new ExchangeError(
      'bitget {"code":"40034","msg":"Invalid symbol"}'
    );
    const result = handleError(error);
    expect(result).toEqual<TradekitError>({
      reason: 'TRADEKIT_ERROR',
      info: {
        code: 'BAD_SYMBOL',
        msg: 'Invalid symbol',
      },
    });
  });

  it('should return TRADEKIT_ERROR for bitget code 22002', () => {
    const error = new ExchangeError(
      'bitget {"code":"22002","msg":"Invalid order"}'
    );
    const result = handleError(error);
    expect(result).toEqual<TradekitError>({
      reason: 'TRADEKIT_ERROR',
      info: {
        code: 'INVALID_ORDER',
        msg: 'Invalid order',
      },
    });
  });

  it('should return CCXT_ERROR for BaseError', () => {
    const error = new BaseError('Base error occurred');
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
        msg: 'Some general error',
        code: 'ERROR',
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
