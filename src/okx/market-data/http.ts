import { ok } from 'neverthrow';

import { ProxyRotator } from '../../shared/proxy';
import { IOkxTikerResponse, IOkxTikersResponse } from '../../types/okx';
import { ITradekitResult } from '../../types/shared/errors';
import {
  IGetPriceOptions,
  IGetPricesOptions,
  IGetTikerOptions,
  IGetTikersOptions,
  IPrice,
  ITicker,
} from '../../types/shared/tickers';
import { handleErrors, parseResponse } from '../errors';
import { priceAdapter, tickerAdapter } from './adapters';

export class OkxMarketDataHttpHandler {
  constructor(private http: ProxyRotator) {}

  public async getPrice(
    opts: IGetPriceOptions
  ): Promise<ITradekitResult<IPrice>> {
    const instId = opts.symbol.replace('/', '-');
    try {
      const { data } = await this.http.get<IOkxTikerResponse>(
        'api/v5/market/ticker',
        {
          params: { instId },
        }
      );

      const err = parseResponse(data);
      if (err) return err;

      return ok(priceAdapter(data.data[0]));
    } catch (error) {
      return handleErrors(error);
    }
  }

  public async getPrices(
    opts: IGetPricesOptions
  ): Promise<ITradekitResult<IPrice[]>> {
    const instIds = opts.symbols.map(s => s.replace('/', '-'));
    const instType = 'SPOT';
    try {
      const { data } = await this.http.get<IOkxTikersResponse>(
        'api/v5/market/tickers',
        {
          params: { instType },
        }
      );

      const err = parseResponse(data);
      if (err) return err;

      const prices = data.data.filter(d => instIds.includes(d.instId));
      return ok(prices.map(d => priceAdapter(d)));
    } catch (error) {
      return handleErrors(error);
    }
  }

  public async getTicker(
    opts: IGetTikerOptions
  ): Promise<ITradekitResult<ITicker>> {
    const instId = opts.symbol.replace('/', '-');
    try {
      const { data } = await this.http.get<IOkxTikerResponse>(
        'api/v5/market/ticker',
        {
          params: { instId },
        }
      );

      const err = parseResponse(data);
      if (err) return err;

      return ok(tickerAdapter(data.data[0]));
    } catch (error) {
      return handleErrors(error);
    }
  }

  public async getTickers(
    opts: IGetTikersOptions
  ): Promise<ITradekitResult<ITicker[]>> {
    const instIds = opts.symbols.map(s => s.replace('/', '-'));
    const instType = 'SPOT';
    try {
      const { data } = await this.http.get<IOkxTikersResponse>(
        'api/v5/market/tickers',
        {
          params: { instType },
        }
      );

      const err = parseResponse(data);
      if (err) return err;

      const tickers = data.data.filter(d => instIds.includes(d.instId));
      return ok(tickers.map(d => tickerAdapter(d)));
    } catch (error) {
      return handleErrors(error);
    }
  }
}
