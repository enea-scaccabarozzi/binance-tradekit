/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { WebsocketClient } from 'bybit-api';

import { BybitStreamClient } from '../websoket';
import { BybitWssUpdate } from '../../types/bybit';
import { BaseSubscriptionOptions, Ticker } from '../../types/shared/tickers';

vi.mock('bybit-api', async () => {
  const originalModule = await vi.importActual('bybit-api');
  return {
    ...originalModule,
    WebsocketClient: vi.fn(),
  };
});

interface MockWebSocketClient extends Partial<WebsocketClient> {
  on: Mock;
  subscribeV5: Mock;
  closeAll: Mock;
}

describe('BybitStreamClient', () => {
  let mockWebSocketClient: MockWebSocketClient;
  const opts: BaseSubscriptionOptions<Ticker> & {
    testnet: boolean;
    symbols: string[];
  } = {
    testnet: true,
    symbols: ['BTC/USDT:USDT'],
    onClose: vi.fn(),
    onSubscription: vi.fn(),
    onError: vi.fn(),
    onUpdate: vi.fn(),
  };

  beforeEach(() => {
    mockWebSocketClient = {
      on: vi.fn(),
      subscribeV5: vi.fn(),
      closeAll: vi.fn(),
    } as MockWebSocketClient;
    (WebsocketClient as unknown as Mock).mockImplementation(
      () => mockWebSocketClient
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize WebSocketClient with correct parameters', () => {
    new BybitStreamClient(opts);

    expect(WebsocketClient).toHaveBeenCalled();
  });

  it('should subscribe to symbols on initialization', () => {
    new BybitStreamClient(opts);

    expect(mockWebSocketClient.subscribeV5).toHaveBeenCalledWith(
      ['tickers.BTCUSDT'],
      'linear'
    );
  });

  it('should handle open event', () => {
    new BybitStreamClient(opts);

    const openCallback = mockWebSocketClient.on.mock.calls.find(
      call => call[0] === 'open'
    )?.[1];
    openCallback && openCallback();

    expect(opts.onSubscription).toHaveBeenCalled();
  });

  it('should handle close event', () => {
    new BybitStreamClient(opts);

    const closeCallback = mockWebSocketClient.on.mock.calls.find(
      call => call[0] === 'close'
    )?.[1];
    closeCallback && closeCallback();

    expect(opts.onClose).toHaveBeenCalled();
  });

  it('should handle error event', () => {
    new BybitStreamClient(opts);

    const errorCallback = mockWebSocketClient.on.mock.calls.find(
      call => call[0] === 'error'
    )?.[1];
    const error = new Error('Test error');
    errorCallback && errorCallback(error);

    expect(opts.onError).toHaveBeenCalledWith(
      expect.objectContaining({
        reason: 'WEB_SOCKET_ERROR',
      })
    );
  });

  it('should handle update event with snapshot', () => {
    new BybitStreamClient(opts);

    const updateCallback = mockWebSocketClient.on.mock.calls.find(
      call => call[0] === 'update'
    )?.[1];

    const snapshotData: BybitWssUpdate = {
      type: 'snapshot',
      data: {
        symbol: 'BTC/USDT:USDT',
        highPrice24h: '60000',
        lowPrice24h: '50000',
        bid1Price: '59000',
        bid1Size: '1',
        ask1Price: '60000',
        ask1Size: '1',
        turnover24h: '1000000',
        volume24h: '100',
        prevPrice24h: '58000',
        lastPrice: '59500',
        price24hPcnt: '0.025',
        tickDirection: 'PlusTick',
        prevPrice1h: '59000',
        markPrice: '59500',
        indexPrice: '59500',
        openInterest: '100',
        openInterestValue: '1000000',
        nextFundingTime: '2021-01-01T00:00:00Z',
        fundingRate: '0.0001',
      },
      topic: 'tickers.BTCUSDT',
      ts: 1234567890,
    };

    updateCallback && updateCallback(snapshotData);

    expect(opts.onUpdate).not.toHaveBeenCalled();
  });

  it('should handle update event with non-snapshot data', () => {
    new BybitStreamClient(opts);

    const updateCallback = mockWebSocketClient.on.mock.calls.find(
      call => call[0] === 'update'
    )?.[1];

    const snapshotData: BybitWssUpdate = {
      type: 'snapshot',
      data: {
        symbol: 'BTCUSDT',
        highPrice24h: '60000',
        lowPrice24h: '50000',
        bid1Price: '59000',
        bid1Size: '1',
        ask1Price: '60000',
        ask1Size: '1',
        turnover24h: '1000000',
        volume24h: '100',
        prevPrice24h: '58000',
        lastPrice: '59500',
        price24hPcnt: '0.025',
        tickDirection: 'PlusTick',
        prevPrice1h: '59000',
        markPrice: '59500',
        indexPrice: '59500',
        openInterest: '100',
        openInterestValue: '1000000',
        nextFundingTime: '2021-01-01T00:00:00Z',
        fundingRate: '0.0001',
      },
      topic: 'tickers.BTCUSDT',
      ts: 1234567890,
    };

    updateCallback && updateCallback(snapshotData);

    const updateData: BybitWssUpdate = {
      type: 'delta',
      data: {
        lastPrice: '59600',
      },
      topic: 'tickers.BTCUSDT',
      ts: 1234567890,
    };

    updateCallback && updateCallback(updateData);

    expect(opts.onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        symbol: 'BTC/USDT:USDT',
        last: 59600,
      })
    );
  });

  it('should close WebSocketClient', () => {
    const client = new BybitStreamClient(opts);
    client.close();

    expect(mockWebSocketClient.closeAll).toHaveBeenCalled();
  });
});
