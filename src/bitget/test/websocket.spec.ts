/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { WebsocketClientV2 } from 'bitget-api';

import { BitgetStreamClient } from '../websoket';
import { BaseSubscriptionOptions, Ticker } from '../../types/shared/tickers';
import { BitgetWssUpdate } from '../../types/bitget';

vi.mock('bitget-api', async () => {
  const originalModule = await vi.importActual('bitget-api');
  return {
    ...originalModule,
    WebsocketClientV2: vi.fn(),
  };
});

interface MockWebSocketClient extends Partial<WebsocketClientV2> {
  on: Mock;
  subscribeTopic: Mock;
  closeAll: Mock;
}

describe('BitgetStreamClient', () => {
  let mockWebSocketClient: MockWebSocketClient;
  const opts: BaseSubscriptionOptions<Ticker> & {
    symbols: string[];
  } = {
    symbols: ['BTC/USDT:USDT'],
    onClose: vi.fn(),
    onSubscription: vi.fn(),
    onError: vi.fn(),
    onUpdate: vi.fn(),
  };

  beforeEach(() => {
    mockWebSocketClient = {
      on: vi.fn(),
      subscribeTopic: vi.fn(),
      closeAll: vi.fn(),
    } as MockWebSocketClient;
    (WebsocketClientV2 as unknown as Mock).mockImplementation(
      () => mockWebSocketClient
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize WebSocketClient with correct parameters', () => {
    new BitgetStreamClient(opts);

    expect(WebsocketClientV2).toHaveBeenCalledOnce();
  });

  it('should subscribe to symbols on initialization', () => {
    new BitgetStreamClient(opts);

    expect(mockWebSocketClient.subscribeTopic).toHaveBeenCalledWith(
      'USDT-FUTURES',
      'ticker',
      'BTCUSDT'
    );
  });

  it('should handle open event', () => {
    new BitgetStreamClient(opts);

    const openCallback = mockWebSocketClient.on.mock.calls.find(
      call => call[0] === 'open'
    )?.[1];
    openCallback && openCallback();

    expect(opts.onSubscription).toHaveBeenCalled();
  });

  it('should handle close event', () => {
    new BitgetStreamClient(opts);

    const closeCallback = mockWebSocketClient.on.mock.calls.find(
      call => call[0] === 'close'
    )?.[1];
    closeCallback && closeCallback();

    expect(opts.onClose).toHaveBeenCalled();
  });

  it('should handle error event', () => {
    new BitgetStreamClient(opts);

    const errorCallback = mockWebSocketClient.on.mock.calls.find(
      call => call[0] === 'exception'
    )?.[1];
    const error = new Error('Test error');
    errorCallback && errorCallback(error);

    expect(opts.onError).toHaveBeenCalledWith(
      expect.objectContaining({
        reason: 'WEB_SOCKET_ERROR',
      })
    );
  });

  it('should handle update event with snapshot action', () => {
    new BitgetStreamClient(opts);
    const mockData: BitgetWssUpdate = {
      action: 'snapshot',
      arg: {
        instType: 'USDT-FUTURES',
        instId: 'BTCUSDT',
        channel: 'ticker',
      },
      ts: 1234567890,
      wsKey: 'key',
      data: [
        {
          instId: 'BTCUSDT',
          lastPr: '69764.7',
          bidPr: '69766.1',
          askPr: '69768.2',
          bidSz: '14.093',
          askSz: '3.056',
          open24h: '70459.5',
          high24h: '70691.4',
          low24h: '69221.0',
          change24h: '0.00435',
          fundingRate: '0.000124',
          nextFundingTime: '1716422400000',
          markPrice: '69763.6',
          indexPrice: '69752.5',
          holdingAmount: '93498.725',
          baseVolume: '156364.113',
          quoteVolume: '10933626685.945',
          openUtc: '70147.2',
          symbolType: '1',
          symbol: 'BTCUSDT',
          deliveryPrice: '0',
          ts: '1716406573063',
        },
      ],
    };

    const expectedTicker: Ticker = {
      symbol: 'BTCUSDT',
      timestamp: 1716406573063,
      datetime: new Date(1716406573063),
      last: 69764.7,
      close: 69764.7,
      absChange: 69764.7 - 70459.5,
      percChange: ((69764.7 - 70459.5) / 70459.5) * 100,
      high: 70691.4,
      low: 69221.0,
      volume: 156364.113,
      baseVolume: 156364.113,
      quoteVolume: 10933626685.945,
      open: 70459.5,
      openTime: new Date('1970-01-01T19:29:07.000Z'),
      info: mockData.data[0],
    };

    // Mock the update event with the sample data
    mockWebSocketClient.on.mock.calls.find(call => call[0] === 'update')?.[1](
      mockData
    );

    expect(opts.onUpdate).toHaveBeenCalledWith(expectedTicker);
  });

  it('should handle update event with delta action', () => {
    new BitgetStreamClient(opts);
    const mockDataSnapshot: BitgetWssUpdate = {
      action: 'snapshot',
      arg: {
        instType: 'USDT-FUTURES',
        instId: 'BTCUSDT',
        channel: 'ticker',
      },
      ts: 1234567890,
      wsKey: 'key',
      data: [
        {
          instId: 'BTCUSDT',
          lastPr: '69764.7',
          bidPr: '69766.1',
          askPr: '69768.2',
          bidSz: '14.093',
          askSz: '3.056',
          open24h: '70459.5',
          high24h: '70691.4',
          low24h: '69221.0',
          change24h: '0.00435',
          fundingRate: '0.000124',
          nextFundingTime: '1716422400000',
          markPrice: '69763.6',
          indexPrice: '69752.5',
          holdingAmount: '93498.725',
          baseVolume: '156364.113',
          quoteVolume: '10933626685.945',
          openUtc: '70147.2',
          symbolType: '1',
          symbol: 'BTCUSDT',
          deliveryPrice: '0',
          ts: '1716406573063',
        },
      ],
    };

    const mockDataDelta: BitgetWssUpdate = {
      action: 'delta',
      arg: {
        instType: 'USDT-FUTURES',
        instId: 'BTCUSDT',
        channel: 'ticker',
      },
      ts: 1234567890,
      wsKey: 'key',
      data: [
        {
          instId: 'BTCUSDT',
          lastPr: '79764.7',
        },
      ],
    };

    const expectedTicker: Ticker = {
      symbol: 'BTCUSDT',
      timestamp: 1716406573063,
      datetime: new Date(1716406573063),
      last: 79764.7,
      close: 79764.7,
      absChange: 79764.7 - 70459.5,
      percChange: ((79764.7 - 70459.5) / 70459.5) * 100,
      high: 70691.4,
      low: 69221.0,
      volume: 156364.113,
      baseVolume: 156364.113,
      quoteVolume: 10933626685.945,
      open: 70459.5,
      openTime: new Date('1970-01-01T19:29:07.000Z'),
      info: { ...mockDataSnapshot.data[0], lastPr: '79764.7' },
    };

    // Mock the update event with the sample data
    mockWebSocketClient.on.mock.calls.find(call => call[0] === 'update')?.[1](
      mockDataSnapshot
    );
    mockWebSocketClient.on.mock.calls.find(call => call[0] === 'update')?.[1](
      mockDataDelta
    );

    expect(opts.onUpdate).toHaveBeenCalledWith(expectedTicker);
  });

  it('should close WebSocketClient', () => {
    const client = new BitgetStreamClient(opts);
    client.close();

    expect(mockWebSocketClient.closeAll).toHaveBeenCalled();
  });
});
