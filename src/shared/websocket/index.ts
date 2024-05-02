import {
  ExponentialBackoff,
  Websocket,
  WebsocketBuilder,
  WebsocketEvent,
} from 'websocket-ts';
import { IStremClientOptions } from '../../types/shared/websocket';

export class ReadOnlyStremClient<Raw, Refined> {
  private ws: Websocket;

  constructor(opts: IStremClientOptions<Raw, Refined>) {
    this.ws = new WebsocketBuilder(opts.host)
      .withBackoff(new ExponentialBackoff(10000, 6))
      .build();

    this.ws.addEventListener(WebsocketEvent.message, (i, ev) => {
      const data = JSON.parse(ev.data) as Raw;
      if (opts.handlers && opts.handlers.message)
        return opts.handlers.message(opts.adapter(data));
    });
    if (opts.handlers.open)
      this.ws.addEventListener(WebsocketEvent.open, opts.handlers.open);
    if (opts.handlers.close)
      this.ws.addEventListener(WebsocketEvent.close, opts.handlers.close);
    if (opts.handlers.error)
      this.ws.addEventListener(WebsocketEvent.error, opts.handlers.error);
    if (opts.handlers.reconnect)
      this.ws.addEventListener(
        WebsocketEvent.reconnect,
        opts.handlers.reconnect
      );
    if (opts.handlers.retry)
      this.ws.addEventListener(WebsocketEvent.retry, opts.handlers.retry);
  }

  public close(): void {
    this.ws.close();
  }
}
