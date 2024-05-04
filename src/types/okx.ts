export interface IOxkResponse<T = never> {
  code: string;
  data: T;
  msg: string;
}

export interface IOkxTiker {
  instType: 'SWAP' | 'SPOT' | 'FUTURES' | 'OPTION';
  instId: string;
  last: string;
  lastSz: string;
  askPx: string;
  askSz: string;
  bidPx: string;
  bidSz: string;
  open24h: string;
  high24h: string;
  low24h: string;
  volCcy24h: string;
  vol24h: string;
  sodUtc0: string;
  sodUtc8: string;
  ts: string;
}

export type IOkxTikerResponse = IOxkResponse<[IOkxTiker]>;
export type IOkxTikersResponse = IOxkResponse<IOkxTiker[]>;

interface IOkxCurrencyBalance {
  availBal: string;
  availEq: string;
  borrowFroz: string;
  cashBal: string;
  ccy: string;
  crossLiab: string;
  disEq: string;
  eq: string;
  eqUsd: string;
  fixedBal: string;
  frozenBal: string;
  imr: string;
  interest: string;
  isoEq: string;
  isoLiab: string;
  isoUpl: string;
  liab: string;
  maxLoan: string;
  mgnRatio: string;
  mmr: string;
  notionalLever: string;
  ordFrozen: string;
  rewardBal: string;
  spotInUseAmt: string;
  spotIsoBal: string;
  stgyEq: string;
  twap: string;
  uTime: string;
  upl: string;
  uplLiab: string;
}

export interface IOkxBalance {
  adjEq: string;
  borrowFroz: string;
  details: IOkxCurrencyBalance[];
  imr: string;
  isoEq: string;
  mgnRatio: string;
  mmr: string;
  notionalUsd: string;
  ordFroz: string;
  totalEq: string;
  uTime: string;
  upl: string;
}

interface IOkxBaseWebsocketResponse {
  event: 'error' | 'subscribe' | undefined;
}

interface IOkxWebsocketErrorResponse extends IOkxBaseWebsocketResponse {
  event: 'error';
  code: string;
  msg: string;
  connId: string;
}

interface IOkxWebsocketSubscribedResponse extends IOkxBaseWebsocketResponse {
  event: 'subscribe';
  arg: {
    channel: string;
    instId: string;
  };
  connId: string;
}

export interface IOkxWebocketPushResponse extends IOkxBaseWebsocketResponse {
  event: undefined;
  arg: {
    channel: string;
    instId: string;
  };
  data: IOkxTiker[];
}

export type IOkxWebsocketResponse =
  | IOkxWebsocketErrorResponse
  | IOkxWebsocketSubscribedResponse
  | IOkxWebocketPushResponse;
