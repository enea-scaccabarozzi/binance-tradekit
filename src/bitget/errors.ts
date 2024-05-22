import {
  NetworkError,
  RateLimitExceeded,
  ExchangeError,
  BadSymbol,
  BaseError,
} from 'ccxt';

import { TradekitError } from '../types/shared/errors';

export const handleError = (e: unknown): TradekitError => {
  if (e instanceof NetworkError) {
    if (e instanceof RateLimitExceeded) return { reason: 'RATE_LIMIT' };
    else
      return {
        reason: 'NETWORK_ERROR',
        info: {
          msg: e.message,
        },
      };
  }
  if (e instanceof ExchangeError) {
    if (e instanceof BadSymbol) {
      return {
        reason: 'TRADEKIT_ERROR',
        info: {
          code: 'BAD_SYMBOL',
          msg: e.message,
        },
      };
    }

    const parsed = JSON.parse(e.message.replace('bitget ', '')) as {
      code: string;
      msg: string;
    };
    if (parsed.code === '40034') {
      return {
        reason: 'TRADEKIT_ERROR',
        info: {
          code: 'BAD_SYMBOL',
          msg: parsed.msg,
        },
      };
    }
    if (parsed.code === '22002') {
      return {
        reason: 'TRADEKIT_ERROR',
        info: {
          code: 'INVALID_ORDER',
          msg: parsed.msg,
        },
      };
    }
    return {
      reason: 'EXCHANGE_ERROR',
      info: {
        exchange: 'bitget',
        code: parsed.code,
        msg: parsed.msg,
      },
    };
  }
  if (e instanceof BaseError) {
    return {
      reason: 'CCXT_ERROR',
      info: {
        code: e.name
          .split(/\.?(?=[A-Z])/)
          .join('_')
          .toUpperCase(),
        msg: e.message,
        original: e,
      },
    };
  }
  if (e instanceof Error)
    return {
      reason: 'UNKNOWN_ERROR',
      info: {
        msg: e.message,
        code: e.name
          .split(/\.?(?=[A-Z])/)
          .join('_')
          .toUpperCase(),
      },
    };
  return {
    reason: 'UNKNOWN_ERROR',
    info: {
      msg: 'If you see this error you have successfully broken my code. Congratulations!',
      code: 'GOOD_JOB',
    },
  };
};
