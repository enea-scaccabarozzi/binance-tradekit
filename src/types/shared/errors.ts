import { Result } from 'neverthrow';

// Base interface for all types of errors
type IErrorReason =
  | 'RATE_LIMIT'
  | 'EXCHANGE_ERROR'
  | 'UNKNOWN_ERROR'
  | 'WEB_SOCKET_ERROR'
  | 'NETWORK_ERROR';

interface ITradekitErrorBase {
  reason: IErrorReason;
}

interface ITradekitRateLimitError extends ITradekitErrorBase {
  reason: 'RATE_LIMIT';
}

interface ITradekitExchangeError extends ITradekitErrorBase {
  reason: 'EXCHANGE_ERROR';
  info: {
    statusCode: number;
    code: number;
    msg: string;
  };
}

interface ITradekitWebSocketError extends ITradekitErrorBase {
  reason: 'WEB_SOCKET_ERROR';
  info: {
    msg: string;
    code: number;
    connId: string;
  };
}

interface INetworkError extends ITradekitErrorBase {
  reason: 'NETWORK_ERROR';
  info: {
    msg: string;
  };
}

interface ITradekitUnknownError extends ITradekitErrorBase {
  reason: 'UNKNOWN_ERROR';
  info: {
    msg: string;
    code: string;
  };
}

export type ITradekitError =
  | ITradekitRateLimitError
  | ITradekitExchangeError
  | ITradekitUnknownError
  | ITradekitWebSocketError
  | INetworkError;

export type ITradekitResult<T> = Result<T, ITradekitError>;
