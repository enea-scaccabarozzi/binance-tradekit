import { IOkxTiker } from '../../types/okx';
import { IPrice, ITicker } from '../../types/shared/tickers';

export const priceAdapter = (data: IOkxTiker): IPrice => {
  return {
    symbol: `${data.instId.split('-')[0]}/${data.instId.split('-')[1]}`,
    datetime: new Date(parseInt(data.ts)),
    price: parseFloat(data.last),
  };
};

export const tickerAdapter = (data: IOkxTiker): ITicker => {
  const ONE_DAY = 24 * 60 * 60 * 1000;
  return {
    symbol: `${data.instId.split('-')[0]}/${data.instId.split('-')[1]}`,
    datetime: new Date(parseInt(data.ts)),
    high: parseFloat(data.high24h),
    low: parseFloat(data.low24h),
    bid: {
      price: parseFloat(data.bidPx),
      size: parseFloat(data.bidSz),
    },
    ask: {
      price: parseFloat(data.askPx),
      size: parseFloat(data.askSz),
    },
    open: {
      price: parseFloat(data.open24h),
      datetime: new Date(new Date(parseInt(data.ts)).getTime() - ONE_DAY),
    },
    last: parseFloat(data.last),
    timeframe: '1d',
  };
};
