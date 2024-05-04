import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import { WebSocketServer as Server } from 'ws';
import { ReadOnlyStremClient } from '../index'; // Adjust the path as necessary

describe('ReadOnlyStremClient E2E Tests', () => {
  let server: Server;
  let client: ReadOnlyStremClient<any, any>;
  const port = 3000;
  const host = `ws://localhost:${port}`;

  const mockOnMessage = vi.fn(() => {
    return;
  });
  const mockOnOpen = vi.fn(() => {
    return;
  });
  const mockOnClose = vi.fn(() => {
    return;
  });
  const mockOnError = vi.fn(() => {
    return;
  });

  beforeEach(async () => {
    server = new Server({ port });

    await new Promise(resolve => server.on('listening', resolve));

    client = new ReadOnlyStremClient({
      host,
      adapter: (data: any) => data as unknown,
      handlers: {
        message: mockOnMessage,
        open: mockOnOpen,
        close: mockOnClose,
        error: mockOnError,
      },
    });

    await new Promise<void>(resolve => {
      client.ws.on('open', () => {
        resolve();
      });
    });
  });

  afterEach(() => {
    server.close();
    client.close();
  });

  it('should execute onOpen on connection', () => {
    expect(mockOnOpen).toHaveBeenCalled();
  });

  it('should execute onClose on disconnection', async () => {
    client.close();

    // wait for the connection to be established
    await new Promise<void>(resolve => {
      client.ws.on('close', () => {
        resolve();
      });
    });

    expect(mockOnOpen).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });
});
