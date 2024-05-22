type BitgetInstrumentType =
  | 'SPOT'
  | 'USDT-FUTURES'
  | 'COIN-FUTURES'
  | 'USDC-FUTURES'
  | 'SUSDT-FUTURES'
  | 'SCOIN-FUTURES'
  | 'SUSDC-FUTURES';

interface BitgetWssUpdateBase {
  action: 'delta' | 'snapshot';
  arg: {
    instType: BitgetInstrumentType;
    instId: string;
    channel: string;
  };
  ts: number;
  wsKey: string;
}

export interface BitgetWssTiker {
  instId: string;
  lastPr: string;
  bidPr: string;
  askPr: string;
  bidSz: string;
  askSz: string;
  open24h: string;
  high24h: string;
  low24h: string;
  change24h: string;
  fundingRate: string;
  nextFundingTime: string;
  markPrice: string;
  indexPrice: string;
  holdingAmount: string;
  baseVolume: string;
  quoteVolume: string;
  openUtc: string;
  symbolType: string;
  symbol: string;
  deliveryPrice: string;
  ts: string;
}

export interface BitgetWssUpdateSnapshot extends BitgetWssUpdateBase {
  action: 'snapshot';
  data: BitgetWssTiker[];
}

interface BitgetWssUpdateDelta extends BitgetWssUpdateBase {
  action: 'delta';
  data: Partial<BitgetWssTiker>[];
}

export type BitgetWssUpdate = BitgetWssUpdateSnapshot | BitgetWssUpdateDelta;

export interface BitgetWssError {
  event: 'error';
  arg: {
    instType: BitgetInstrumentType;
    channel: string;
    instId: string;
  };
  code: number;
  msg: string;
  op: string;
  wsKey: string;
}

export interface BitgetOrderResponse {
  code: string;
  msg: string;
  requestTime: string;
  data: { clientOid: string; orderId: string };
}
