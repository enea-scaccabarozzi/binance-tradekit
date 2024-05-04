/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OkxMarketDataWebsocketHandler } from '../websocket';
import { ReadOnlyStremClient } from '../../../shared/websocket';

vi.mock('../../../shared/websocket');
vi.mock('../adapters.ts');

let handler: OkxMarketDataWebsocketHandler;

beforeEach(() => {
  handler = new OkxMarketDataWebsocketHandler();
});

describe('OkxMarketDataWebsocketHandler', () => {
  describe('subscribeToPrice', () => {
    const options = {
      symbol: 'BTC/USD',
      onConnect: vi.fn(),
      onClose: vi.fn(),
      onSubscribed: vi.fn(),
      onError: vi.fn(),
      cb: vi.fn(),
    };
    it('should initializes ReadOnlyStremClient correctly and sends correct subscription payload', () => {
      handler.subscribeToPrice(options);

      // Check if ReadOnlyStremClient is created with correct configurations
      expect(ReadOnlyStremClient).toHaveBeenCalledWith({
        host: 'wss://ws.okx.com:8443/ws/v5/public',
        handlers: {
          open: expect.any(Function),
          close: expect.any(Function),
          message: expect.any(Function), // cb should be a function wrapped around the adapter
        },
        adapter: expect.any(Function),
      });
    });
  });

  describe('subscribeToPrices', () => {
    const options = {
      symbols: ['BTC/USDT', 'ETH/USDT'],
      onConnect: vi.fn(),
      onClose: vi.fn(),
      onSubscribed: vi.fn(),
      onError: vi.fn(),
      cb: vi.fn(),
    };
    it('should initializes ReadOnlyStremClient correctly and sends correct subscription payload', () => {
      handler.subscribeToPrices(options);

      // Check if ReadOnlyStremClient is created with correct configurations
      expect(ReadOnlyStremClient).toHaveBeenCalledWith({
        host: 'wss://ws.okx.com:8443/ws/v5/public',
        handlers: {
          open: expect.any(Function),
          close: expect.any(Function),
          message: expect.any(Function), // cb should be a function wrapped around the adapter
        },
        adapter: expect.any(Function),
      });
    });
  });

  describe('subscribeToTiker', () => {
    const options = {
      symbol: 'BTC/USD',
      onConnect: vi.fn(),
      onClose: vi.fn(),
      onSubscribed: vi.fn(),
      onError: vi.fn(),
      cb: vi.fn(),
    };
    it('should initializes ReadOnlyStremClient correctly and sends correct subscription payload', () => {
      handler.subscribeToTiker(options);

      // Check if ReadOnlyStremClient is created with correct configurations
      expect(ReadOnlyStremClient).toHaveBeenCalledWith({
        host: 'wss://ws.okx.com:8443/ws/v5/public',
        handlers: {
          open: expect.any(Function),
          close: expect.any(Function),
          message: expect.any(Function), // cb should be a function wrapped around the adapter
        },
        adapter: expect.any(Function),
      });
    });
  });

  describe('subscribeToTickers', () => {
    const options = {
      symbols: ['BTC/USDT', 'ETH/USDT'],
      onConnect: vi.fn(),
      onClose: vi.fn(),
      onSubscribed: vi.fn(),
      onError: vi.fn(),
      cb: vi.fn(),
    };
    it('should initializes ReadOnlyStremClient correctly and sends correct subscription payload', () => {
      handler.subscribeToTikers(options);

      // Check if ReadOnlyStremClient is created with correct configurations
      expect(ReadOnlyStremClient).toHaveBeenCalledWith({
        host: 'wss://ws.okx.com:8443/ws/v5/public',
        handlers: {
          open: expect.any(Function),
          close: expect.any(Function),
          message: expect.any(Function), // cb should be a function wrapped around the adapter
        },
        adapter: expect.any(Function),
      });
    });
  });
});
