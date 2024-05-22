import { TradekitError } from '../../types/shared/errors';

export const createError = (msg: string): TradekitError => ({
  reason: 'TRADEKIT_ERROR',
  info: {
    code: 'CONVERSION_ERROR',
    msg,
  },
});
