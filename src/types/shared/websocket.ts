import { WebsocketEvent } from 'websocket-ts';

export interface IStremClientOptions<RawData, RefinedData> {
  host: string;
  handlers: {
    [event in Exclude<
      WebsocketEvent,
      WebsocketEvent.message
    >]?: () => void | Promise<void>;
  } & {
    message: (data: RefinedData) => void | Promise<void>;
  };
  adapter: (data: RawData) => RefinedData;
}
