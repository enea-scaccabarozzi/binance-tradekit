/* eslint-disable @typescript-eslint/unbound-method */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReadOnlyStremClient } from '.';
import { Websocket, WebsocketEvent } from 'websocket-ts';
import { IStremClientOptions } from '../../types/shared/websocket';
import { mockDeep, mockReset } from 'vitest-mock-extended';

const mockWebsocket = mockDeep<Websocket>();

vi.mock('websocket-ts', async importOriginal => {
  const mod = await importOriginal<typeof import('websocket-ts')>();
  return {
    ...mod,
    WebsocketBuilder: vi.fn(() => ({
      withBackoff: vi.fn().mockReturnThis(),
      build: vi.fn(() => mockWebsocket),
    })),
  };
});

describe('ReadOnlyStremClient', () => {
  let clientOptions: IStremClientOptions<any, any>;

  beforeEach(() => {
    mockReset(mockWebsocket);
    clientOptions = {
      host: 'ws://example.com',
      handlers: {
        message: vi.fn(),
        open: vi.fn(),
        close: vi.fn(),
        error: vi.fn(),
        reconnect: vi.fn(),
        retry: vi.fn(),
      },
      adapter: vi.fn(data => data as unknown),
    };
  });

  it('should set up event listeners correctly', () => {
    new ReadOnlyStremClient(clientOptions);

    expect(mockWebsocket.addEventListener).toHaveBeenCalledWith(
      WebsocketEvent.message,
      expect.any(Function)
    );
    expect(mockWebsocket.addEventListener).toHaveBeenCalledWith(
      WebsocketEvent.open,
      clientOptions.handlers.open
    );
    expect(mockWebsocket.addEventListener).toHaveBeenCalledWith(
      WebsocketEvent.close,
      clientOptions.handlers.close
    );
    expect(mockWebsocket.addEventListener).toHaveBeenCalledWith(
      WebsocketEvent.error,
      clientOptions.handlers.error
    );
    expect(mockWebsocket.addEventListener).toHaveBeenCalledWith(
      WebsocketEvent.reconnect,
      clientOptions.handlers.reconnect
    );
    expect(mockWebsocket.addEventListener).toHaveBeenCalledWith(
      WebsocketEvent.retry,
      clientOptions.handlers.retry
    );
  });

  it('should handle websocket messages correctly', () => {
    new ReadOnlyStremClient(clientOptions);
    const messageHandler = vi
      .mocked(mockWebsocket.addEventListener)
      .mock.calls.find(call => call[0] === WebsocketEvent.message)?.[1];
    const testMessage = { data: JSON.stringify({ key: 'value' }) };

    expect(messageHandler).toBeDefined();

    // Simulating message event call
    if (messageHandler)
      messageHandler(mockWebsocket, testMessage as MessageEvent);

    expect(clientOptions.adapter).toHaveBeenCalledWith({ key: 'value' });
    expect(clientOptions.handlers.message).toHaveBeenCalledWith({
      key: 'value',
    });
  });

  it('should correctly use the adapter function to transform websocket data', () => {
    new ReadOnlyStremClient(clientOptions);
    const messageHandler = vi
      .mocked(mockWebsocket.addEventListener)
      .mock.calls.find(call => call[0] === WebsocketEvent.message)?.[1];
    const testMessage = {
      data: JSON.stringify({ key: 'value', anotherKey: 'anotherValue' }),
    };

    expect(messageHandler).toBeDefined();

    if (messageHandler)
      messageHandler(mockWebsocket, testMessage as MessageEvent);

    expect(clientOptions.adapter).toHaveBeenCalledWith({
      key: 'value',
      anotherKey: 'anotherValue',
    });
    expect(clientOptions.handlers.message).toHaveBeenCalledWith({
      key: 'value',
      anotherKey: 'anotherValue',
    });
    expect(clientOptions.adapter).toReturnWith({
      key: 'value',
      anotherKey: 'anotherValue',
    });
  });

  it('should close the websocket when close is called', () => {
    const client = new ReadOnlyStremClient(clientOptions);
    client.close();

    expect(mockWebsocket.close).toHaveBeenCalled();
  });
});
