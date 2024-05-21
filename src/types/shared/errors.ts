import { Result } from 'neverthrow';
import * as ccxt from 'ccxt';

// Base interface for all types of errors
type ErrorReason =
  | 'TRADEKIT_ERROR'
  | 'RATE_LIMIT'
  | 'EXCHANGE_ERROR'
  | 'UNKNOWN_ERROR'
  | 'WEB_SOCKET_ERROR'
  | 'CCXT_ERROR'
  | 'NETWORK_ERROR';

interface TradekitErrorBase {
  reason: ErrorReason;
}

interface TradekitRateLimitError extends TradekitErrorBase {
  reason: 'RATE_LIMIT';
}

interface TradekitExchangeError extends TradekitErrorBase {
  reason: 'EXCHANGE_ERROR';
  info: {
    exchange: string;
    code: string;
    msg: string;
  };
}

interface TradekitWebSocketError extends TradekitErrorBase {
  reason: 'WEB_SOCKET_ERROR';
  info: {
    msg: string;
    code: string;
    connId: string;
  };
}

interface INetworkError extends TradekitErrorBase {
  reason: 'NETWORK_ERROR';
  info: {
    msg: string;
  };
}

interface TradekitUnknownError extends TradekitErrorBase {
  reason: 'UNKNOWN_ERROR';
  info: {
    msg: string;
    code: string;
  };
}

interface TradekitErrorGeneric extends TradekitErrorBase {
  reason: 'TRADEKIT_ERROR';
  info: {
    msg: string;
    code: string;
  };
}

interface TradekitCCXTError extends TradekitErrorBase {
  reason: 'CCXT_ERROR';
  info: {
    code: string;
    msg: string;
    original: ccxt.BaseError;
  };
}

export type TradekitError =
  | TradekitRateLimitError
  | TradekitExchangeError
  | TradekitUnknownError
  | TradekitWebSocketError
  | TradekitErrorGeneric
  | TradekitCCXTError
  | INetworkError;

export type TradekitResult<T> = Result<T, TradekitError>;
