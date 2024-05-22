import { WsMessage24hrTickerFormatted } from 'binance';

export type BinanceWssUpdate = Omit<
  WsMessage24hrTickerFormatted,
  | 'previousClose'
  | 'bestBid'
  | 'bestBidQuantity'
  | 'bestAskPrice'
  | 'bestAskQuantity'
>;
