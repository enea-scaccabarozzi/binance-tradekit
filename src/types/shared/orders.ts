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
