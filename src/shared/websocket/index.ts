/* eslint-disable @typescript-eslint/no-misused-promises */
import WebSocket from 'ws';
import { IStremClientOptions } from '../../types/shared/websocket';

export class ReadOnlyStremClient<Raw, Refined> {
  private ws: WebSocket;

  constructor(opts: IStremClientOptions<Raw, Refined>) {
    this.ws = new WebSocket(opts.host);

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.ws.on('message', data => {
      const parsed = JSON.parse(data.toString()) as Raw;
      if (opts.handlers && opts.handlers.message) {
        const res = opts.adapter(parsed);
        if (res) return opts.handlers.message(res);
      }
    });

    if (opts.handlers.open) this.ws.on('open', () => opts.handlers.open?.());
    if (opts.handlers.close) this.ws.on('close', () => opts.handlers.close?.());
    if (opts.handlers.error)
      this.ws.on('error', error => opts.handlers.error?.(error));
    if (opts.handlers.reconnect)
      this.ws.on('reconnect', () => opts.handlers.reconnect?.());
    if (opts.handlers.retry) this.ws.on('retry', () => opts.handlers.retry?.());
  }

  public close(): void {
    this.ws.close();
  }

  public send(data: unknown): void {
    const payload = JSON.stringify(data);
    this.ws.send(payload);
  }
}
