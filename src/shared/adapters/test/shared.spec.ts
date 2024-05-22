import { describe, it, expect } from 'vitest';

import { createError } from '../shared';
import { TradekitError } from '../../../types/shared/errors';

describe('createError', () => {
  it('should create an error with the given message', () => {
    const msg = 'An error occurred';
    const expectedError: TradekitError = {
      reason: 'TRADEKIT_ERROR',
      info: {
        code: 'CONVERSION_ERROR',
        msg,
      },
    };

    const result = createError(msg);

    expect(result).toEqual(expectedError);
  });

  it('should create an error with a different message', () => {
    const msg = 'Another error occurred';
    const expectedError: TradekitError = {
      reason: 'TRADEKIT_ERROR',
      info: {
        code: 'CONVERSION_ERROR',
        msg,
      },
    };

    const result = createError(msg);

    expect(result).toEqual(expectedError);
  });
});
