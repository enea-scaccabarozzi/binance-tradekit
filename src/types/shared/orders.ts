export interface Order {
  orderId: string;
  symbol: string;
  price: number;
  quantity: number;
  orderType: 'market' | 'limit' | 'stop' | 'stop-limit';
  side: 'buy' | 'sell';
  status: 'new' | 'filled' | 'canceled';
  timestamp: number;
  datetime: Date;
  clientOrderId?: string;
}

export interface OpenPositionOptions {
  symbol: string;
  amount: number;
  timeInForce?: number;
}

export interface ClosePositionOptions {
  symbol: string;
  amount: number;
  timeInForce?: number;
}
