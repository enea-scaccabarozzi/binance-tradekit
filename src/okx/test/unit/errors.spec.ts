import { describe, it, expect, vi } from 'vitest';
import axios, { AxiosResponse } from 'axios';
import { err } from 'neverthrow';

import { handleErrors, parseResponse } from '../../errors';

// Mock axios to control its behavior
vi.mock('axios', async () => {
  const originalAxios = await vi.importActual<typeof axios>('axios');
  return {
    ...originalAxios,
    default: { ...originalAxios.defaults, isAxiosError: vi.fn() },
  };
});
const mockAxiosError = (response?: AxiosResponse) => ({
  isAxiosError: true,
  response,
  message: 'Network failed',
  name: 'AxiosError',
});

const mockNormalError = () => new Error('Normal error');

describe('handleErrors', () => {
  it('handles axios rate limit errors correctly', () => {
    const axiosError = mockAxiosError({ status: 429 } as AxiosResponse);
    vi.mocked(axios.isAxiosError).mockReturnValue(true);
    const result = handleErrors(axiosError);
    expect(result).toEqual(err({ reason: 'RATE_LIMIT' }));
  });

  it('handles axios exchange errors correctly', () => {
    const axiosError = mockAxiosError({
      status: 500,
      data: { code: '123', msg: 'Exchange error occurred' },
    } as AxiosResponse);
    vi.mocked(axios.isAxiosError).mockReturnValue(true);
    const result = handleErrors(axiosError);
    expect(result).toEqual(
      err({
        reason: 'EXCHANGE_ERROR',
        info: { statusCode: 500, code: 123, msg: 'Exchange error occurred' },
      })
    );
  });

  it('handles network errors for axios without response data', () => {
    const axiosError = mockAxiosError();
    vi.mocked(axios.isAxiosError).mockReturnValue(true);
    const result = handleErrors(axiosError);
    expect(result).toEqual(
      err({
        reason: 'NETWORK_ERROR',
        info: { msg: 'Network failed', code: 'AxiosError' },
      })
    );
  });

  it('handles generic JavaScript errors', () => {
    const error = mockNormalError();
    vi.mocked(axios.isAxiosError).mockReturnValue(false);
    const result = handleErrors(error);
    expect(result).toEqual(
      err({
        reason: 'UNKNOWN_ERROR',
        info: { msg: 'Normal error', code: 'Error' },
      })
    );
  });

  it('handles completely unknown errors', () => {
    const result = handleErrors('a plain string');
    expect(result).toEqual(
      err({
        reason: 'UNKNOWN_ERROR',
        info: {
          msg: 'If you were able to reach this error you broke this lib',
          code: 'WELL_DONE',
        },
      })
    );
  });
});

describe('parseResponse', () => {
  it('returns null if response code is 0', () => {
    const response = { code: '0', msg: 'Success', data: [] };
    const result = parseResponse(response);
    expect(result).toEqual(null);
  });

  it('returns an error if response code is not 0', () => {
    const response = { code: '123', msg: 'Exchange error occurred', data: [] };
    const result = parseResponse(response);
    expect(result).toEqual(
      err({
        reason: 'EXCHANGE_ERROR',
        info: { statusCode: 200, code: 123, msg: 'Exchange error occurred' },
      })
    );
  });
});
