interface BybitWssUpdateBase {
  topic: string;
  type: 'delta' | 'snapshot';
  ts: number;
}

export interface BybitWssUpdateSnapshot extends BybitWssUpdateBase {
  type: 'snapshot';
  data: {
    symbol: string;
    tickDirection: 'ZeroPlusTick' | 'ZeroMinusTick' | 'PlusTick' | 'MinusTick';
    price24hPcnt: string;
    lastPrice: string;
    prevPrice24h: string;
    highPrice24h: string;
    lowPrice24h: string;
    prevPrice1h: string;
    markPrice: string;
    indexPrice: string;
    openInterest: string;
    openInterestValue: string;
    turnover24h: string;
    volume24h: string;
    nextFundingTime: string;
    fundingRate: string;
    bid1Price: string;
    bid1Size: string;
    ask1Price: string;
    ask1Size: string;
  };
}

interface BybitWssUpdateDelta extends BybitWssUpdateBase {
  type: 'delta';
  data: Partial<BybitWssUpdateSnapshot['data']>;
}

export type BybitWssUpdate = BybitWssUpdateSnapshot | BybitWssUpdateDelta;
