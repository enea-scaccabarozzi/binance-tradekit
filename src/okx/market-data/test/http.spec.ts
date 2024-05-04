/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { OkxMarketDataHttpHandler } from '../http';
import { ProxyRotator } from '../../../shared/proxy';
import { IOkxTiker, IOxkResponse } from '../../../types/okx';
import { AxiosError, AxiosResponse } from 'axios';
import { priceAdapter, tickerAdapter } from '../adapters';

// Mocks
vi.mock('../../../shared/proxy', () => {
  return {
    ProxyRotator: vi.fn(() => ({
      get: vi.fn(),
    })),
  };
});

describe('OkxMarketDataHttpHandler', () => {
  const http = new ProxyRotator({});

  const handler = new OkxMarketDataHttpHandler(http);

  afterEach(() => {
    vi.clearAllMocks();
  });

  const tiker: IOkxTiker = {
    instType: 'SPOT',
    instId: 'BTC-USDT',
    last: '40000',
    lastSz: '0.5',
    askPx: '40100',
    askSz: '1',
    bidPx: '39900',
    bidSz: '2',
    open24h: '39000',
    high24h: '41000',
    low24h: '38000',
    volCcy24h: 'USD',
    vol24h: '10000',
    sodUtc0: '...',
    sodUtc8: '...',
    ts: '1620109200000',
  };

  const mockTickerResponse: IOxkResponse<[IOkxTiker]> = {
    code: '0',
    data: [tiker],
    msg: 'success',
  };

  const mockTickersResponse: IOxkResponse<IOkxTiker[]> = {
    code: '0',
    data: [
      tiker,
      { ...tiker, instId: 'ETH-USDT' },
      { ...tiker, instId: 'BTC-ETH' },
    ],
    msg: 'success',
  };

  describe('Prices', () => {
    const expectedPrice = priceAdapter(tiker);
    describe('getPrice', () => {
      it('should return a successful price response', async () => {
        vi.mocked(http.get).mockResolvedValue({
          data: mockTickerResponse,
        } as AxiosResponse);

        // Execute
        const result = await handler.getPrice({ symbol: 'BTC/USDT' });

        // Assert
        expect(http.get).toHaveBeenCalledWith('api/v5/market/ticker', {
          params: { instId: 'BTC-USDT' },
        });
        expect(result._unsafeUnwrap()).toEqual(expectedPrice);
      });

      it('should handle an error correctly', async () => {
        // Setup mock to throw an error
        vi.mocked(http.get).mockRejectedValue(new AxiosError('Network error'));

        const result = await handler.getPrice({ symbol: 'BTC/USD' });

        expect(result._unsafeUnwrapErr()).toEqual({
          reason: 'NETWORK_ERROR',
          info: { msg: 'Network error', code: 'AxiosError' },
        });
      });
    });
    describe('getPrices', () => {
      it('should return a list of selected prices', async () => {
        vi.mocked(http.get).mockResolvedValue({
          data: mockTickersResponse,
        } as AxiosResponse);

        // Execute
        const result = await handler.getPrices({
          symbols: ['BTC/USDT', 'ETH/USDT'],
        });

        // Assert
        expect(http.get).toHaveBeenCalledWith('api/v5/market/tickers', {
          params: { instType: 'SPOT' },
        });
        expect(result._unsafeUnwrap()).toEqual([
          expectedPrice,
          { ...expectedPrice, symbol: 'ETH/USDT' },
        ]);
      });

      it('should filter out unwanted prices', async () => {
        vi.mocked(http.get).mockResolvedValue({
          data: mockTickersResponse,
        } as AxiosResponse);

        // Execute
        const result = await handler.getPrices({
          symbols: ['XRP/USDT'],
        });

        // Assert
        expect(http.get).toHaveBeenCalledWith('api/v5/market/tickers', {
          params: { instType: 'SPOT' },
        });
        expect(result._unsafeUnwrap()).toEqual([]);
      });

      it('should handle an error correctly', async () => {
        // Setup mock to throw an error
        vi.mocked(http.get).mockRejectedValue(new AxiosError('Network error'));

        const result = await handler.getPrices({ symbols: ['BTC/USDT'] });

        expect(result._unsafeUnwrapErr()).toEqual({
          reason: 'NETWORK_ERROR',
          info: { msg: 'Network error', code: 'AxiosError' },
        });
      });
    });
  });

  describe('Tickers', () => {
    const expectedTicker = tickerAdapter(tiker);
    describe('getTicker', () => {
      it('should return a successful ticker response', async () => {
        vi.mocked(http.get).mockResolvedValue({
          data: mockTickerResponse,
        } as AxiosResponse);

        // Execute
        const result = await handler.getTicker({ symbol: 'BTC/USDT' });

        // Assert
        expect(http.get).toHaveBeenCalledWith('api/v5/market/ticker', {
          params: { instId: 'BTC-USDT' },
        });
        expect(result._unsafeUnwrap()).toEqual(expectedTicker);
      });

      it('should handle an error correctly', async () => {
        // Setup mock to throw an error
        vi.mocked(http.get).mockRejectedValue(new AxiosError('Network error'));

        const result = await handler.getTicker({ symbol: 'BTC/USD' });

        expect(result._unsafeUnwrapErr()).toEqual({
          reason: 'NETWORK_ERROR',
          info: { msg: 'Network error', code: 'AxiosError' },
        });
      });
    });
    describe('getTickers', () => {
      it('should return a list of selected tickers', async () => {
        vi.mocked(http.get).mockResolvedValue({
          data: mockTickersResponse,
        } as AxiosResponse);

        // Execute
        const result = await handler.getTickers({
          symbols: ['BTC/USDT', 'ETH/USDT'],
        });

        // Assert
        expect(http.get).toHaveBeenCalledWith('api/v5/market/tickers', {
          params: { instType: 'SPOT' },
        });

        expect(result._unsafeUnwrap()).toEqual([
          expectedTicker,
          { ...expectedTicker, symbol: 'ETH/USDT' },
        ]);
      });

      it('should filter out unwanted prices', async () => {
        vi.mocked(http.get).mockResolvedValue({
          data: mockTickersResponse,
        } as AxiosResponse);

        // Execute
        const result = await handler.getTickers({
          symbols: ['XRP/USDT'],
        });

        // Assert
        expect(http.get).toHaveBeenCalledWith('api/v5/market/tickers', {
          params: { instType: 'SPOT' },
        });
        expect(result._unsafeUnwrap()).toEqual([]);
      });

      it('should handle an error correctly', async () => {
        // Setup mock to throw an error
        vi.mocked(http.get).mockRejectedValue(new AxiosError('Network error'));

        const result = await handler.getTickers({ symbols: ['BTC/USDT'] });

        expect(result._unsafeUnwrapErr()).toEqual({
          reason: 'NETWORK_ERROR',
          info: { msg: 'Network error', code: 'AxiosError' },
        });
      });
    });
  });
});
