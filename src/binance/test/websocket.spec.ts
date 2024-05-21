/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { WebsocketClient } from 'binance';
import { Ticker } from 'ccxt';

import { BinanceStreamClient } from '../websoket';
import { BaseSubscriptionOptions } from '../../types/shared/tickers';
import { BinanceWssUpdate } from '../../types/binance';

vi.mock('binance', async () => {
  const originalModule = await vi.importActual('binance');
  return {
    ...originalModule,
    WebsocketClient: vi.fn(),
  };
});

interface MockWebSocketClient extends Partial<WebsocketClient> {
  on: Mock;
  subscribeSymbol24hrTicker: Mock;
  closeAll: Mock;
}

describe('BinanceStreamClient', () => {
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
      subscribeSymbol24hrTicker: vi.fn(),
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
    new BinanceStreamClient(opts);

    expect(WebsocketClient).toHaveBeenCalledWith({
      beautify: true,
    });
  });

  it('should subscribe to symbols on initialization', () => {
    new BinanceStreamClient(opts);

    expect(mockWebSocketClient.subscribeSymbol24hrTicker).toHaveBeenCalledWith(
      'BTCUSDT',
      'usdm'
    );
  });

  it('should handle open event', () => {
    new BinanceStreamClient(opts);

    const openCallback = mockWebSocketClient.on.mock.calls.find(
      call => call[0] === 'open'
    )?.[1];
    openCallback && openCallback();

    expect(opts.onSubscription).toHaveBeenCalled();
  });

  it('should handle close event', () => {
    new BinanceStreamClient(opts);

    const closeCallback = mockWebSocketClient.on.mock.calls.find(
      call => call[0] === 'close'
    )?.[1];
    closeCallback && closeCallback();

    expect(opts.onClose).toHaveBeenCalled();
  });

  it('should handle error event', () => {
    new BinanceStreamClient(opts);

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

  it('should handle update event', () => {
    const client = new BinanceStreamClient(opts);
    const mockData: BinanceWssUpdate = {
      eventType: '24hrTicker',
      eventTime: 1716278225268,
      symbol: 'BTCUSDT',
      priceChange: 4126,
      priceChangePercent: 6.172,
      weightedAveragePrice: 69367.39,
      currentClose: 70975.9,
      closeQuantity: 0.002,
      open: 66849.9,
      high: 72132.8,
      low: 66716.3,
      baseAssetVolume: 391580.569,
      quoteAssetVolume: 27162923703.13,
      openTime: 1716191820000,
      closeTime: 1716278225266,
      firstTradeId: 5023699555,
      lastTradeId: 5028852175,
      trades: 5152509,
      wsMarket: 'usdm',
      wsKey: 'usdm_ticker_btcusdt_',
    };

    const expectedTicker: Ticker = {
      symbol: mockData.symbol,
      info: mockData,
      timestamp: Math.floor(mockData.eventTime / 1000),
      datetime: new Date(mockData.eventTime).toISOString(),
      high: Math.floor(mockData.high),
      low: Math.floor(mockData.low),
      bid: Math.floor(mockData.currentClose),
      bidVolume: undefined,
      ask: undefined,
      askVolume: undefined,
      vwap: Math.floor(mockData.weightedAveragePrice),
      open: Math.floor(mockData.open),
      close: Math.floor(mockData.currentClose),
      last: Math.floor(mockData.currentClose),
      previousClose: undefined,
      change: Math.floor(mockData.priceChange),
      percentage: Math.floor(mockData.priceChangePercent * 100),
      average: undefined,
      quoteVolume: Math.floor(mockData.quoteAssetVolume),
      baseVolume: Math.floor(mockData.baseAssetVolume),
    };

    // Mock the update event with the sample data
    mockWebSocketClient.on.mock.calls.find(
      call => call[0] === 'formattedMessage'
    )?.[1](mockData);

    expect(opts.onUpdate).toHaveBeenCalledWith(expectedTicker);
  });

  it('should close WebSocketClient', () => {
    const client = new BinanceStreamClient(opts);
    client.close();

    expect(mockWebSocketClient.closeAll).toHaveBeenCalled();
  });
});
