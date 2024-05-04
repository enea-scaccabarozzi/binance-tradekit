import { Err, err } from 'neverthrow';
import axios from 'axios';

import { ITradekitError } from '../types/shared/errors';
import { IOxkResponse } from '../types/okx';

export const handleErrors = (error: unknown): Err<never, ITradekitError> => {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 429) {
      return err({ reason: 'RATE_LIMIT' });
    }
    if (error.response) {
      const data = error.response.data as IOxkResponse;
      return err({
        reason: 'EXCHANGE_ERROR',
        info: {
          statusCode: error.response.status,
          code: parseInt(data.code),
          msg: data.msg,
        },
      });
    }
    return err({
      reason: 'NETWORK_ERROR',
      info: { msg: error.message, code: error.name },
    });
  } else if (error instanceof Error) {
    return err({
      reason: 'UNKNOWN_ERROR',
      info: { msg: error.message, code: error.name },
    });
  }
  return err({
    reason: 'UNKNOWN_ERROR',
    info: {
      msg: 'If you were able to reach this error you broke this lib',
      code: 'WELL_DONE',
    },
  });
};

export const parseResponse = <T>(
  response: IOxkResponse<T>
): Err<never, ITradekitError> | null => {
  if (parseInt(response.code) == 0) return null;
  return err({
    reason: 'EXCHANGE_ERROR',
    info: {
      statusCode: 200,
      code: parseInt(response.code),
      msg: response.msg,
    },
  });
};
