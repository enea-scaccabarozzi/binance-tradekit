/* eslint-disable @typescript-eslint/unbound-method */

import { describe, it, expect, vi, afterEach } from 'vitest';
import WebSocket from 'ws';

import { ReadOnlyStremClient } from '..';
import { WebsocketEvent } from 'websocket-ts';

vi.mock('ws');

const clientOptions = {
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

describe('ReadOnlyStremClient', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should set up event listeners correctly', () => {
    new ReadOnlyStremClient(clientOptions);

    const mockWebsocket = vi.mocked(WebSocket).mock.instances[0];

    expect(mockWebsocket.on).toHaveBeenCalledWith(
      WebsocketEvent.message,
      expect.any(Function)
    );
    expect(mockWebsocket.on).toHaveBeenCalledWith(
      WebsocketEvent.open,
      expect.any(Function)
    );
    expect(mockWebsocket.on).toHaveBeenCalledWith(
      WebsocketEvent.close,
      expect.any(Function)
    );
    expect(mockWebsocket.on).toHaveBeenCalledWith(
      WebsocketEvent.error,
      expect.any(Function)
    );
    expect(mockWebsocket.on).toHaveBeenCalledWith(
      WebsocketEvent.reconnect,
      expect.any(Function)
    );
    expect(mockWebsocket.on).toHaveBeenCalledWith(
      WebsocketEvent.retry,
      expect.any(Function)
    );
  });

  it('should handle websocket messages correctly', () => {
    new ReadOnlyStremClient(clientOptions);

    const mockWebsocket = vi.mocked(WebSocket).mock.instances[0];

    const messageHandler = vi
      .mocked(mockWebsocket.on)
      .mock.calls.find(call => call[0] === WebsocketEvent.message)?.[1];
    const testMessage = Buffer.from(JSON.stringify({ key: 'value' }));

    expect(messageHandler).toBeDefined();

    // Simulating message event call
    if (messageHandler) messageHandler(testMessage);

    expect(clientOptions.adapter).toHaveBeenCalledWith({ key: 'value' });
    expect(clientOptions.handlers.message).toHaveBeenCalledWith({
      key: 'value',
    });
  });

  it('should correctly use the adapter function to transform websocket data', () => {
    new ReadOnlyStremClient(clientOptions);

    const mockWebsocket = vi.mocked(WebSocket).mock.instances[0];

    const messageHandler = vi
      .mocked(mockWebsocket.on)
      .mock.calls.find(call => call[0] === WebsocketEvent.message)?.[1];
    const testMessage = Buffer.from(JSON.stringify({ key: 'value' }));

    expect(messageHandler).toBeDefined();

    if (messageHandler) messageHandler(testMessage);

    expect(clientOptions.adapter).toHaveBeenCalledWith({ key: 'value' });
    expect(clientOptions.handlers.message).toHaveBeenCalledWith({
      key: 'value',
    });
    expect(clientOptions.adapter).toReturnWith({ key: 'value' });
  });

  it('should close the websocket when close is called', () => {
    const client = new ReadOnlyStremClient(clientOptions);

    const mockWebsocket = vi.mocked(WebSocket).mock.instances[0];

    client.close();

    expect(mockWebsocket.close).toHaveBeenCalled();
  });

  it('should send object to the websocket when send is called', () => {
    const client = new ReadOnlyStremClient(clientOptions);

    const mockWebsocket = vi.mocked(WebSocket).mock.instances[0];

    const testPayload = { key: 'value' };
    client.send(testPayload);

    expect(mockWebsocket.send).toHaveBeenCalledWith(
      JSON.stringify(testPayload)
    );
  });

  it('should send string to the websocket when send is called', () => {
    const client = new ReadOnlyStremClient(clientOptions);

    const mockWebsocket = vi.mocked(WebSocket).mock.instances[0];

    const testPayload = 'test';
    client.send(testPayload);

    expect(mockWebsocket.send).toHaveBeenCalledWith(
      JSON.stringify(testPayload)
    );
  });
});
