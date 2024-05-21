import * as ccxt from 'ccxt';
import { ok, err } from 'neverthrow';

import { BaseClass } from '../shared/base';
import { Tradekit, TradekitOptions } from '../types/shared';
import {
  GetTikerOptions,
  GetTikersOptions,
  SubscribeToTikerOptions,
  SubscribeToTikersOptions,
} from '../types/shared/tickers';
import { TradekitResult } from '../types/shared/errors';
import { GetBalanceOptions, SetLeverageOptions } from '../types/shared/account';
import {
  ClosePositionOptions,
  OpenPositionOptions,
} from '../types/shared/orders';
import { handleError } from './errors';
import { syncCCXTProxy } from '../shared/proxy/sync';
import { BinanceStreamClient } from './websoket';

export class Binance extends BaseClass implements Tradekit {
  protected exchange = new ccxt.binance();

  constructor(opts?: TradekitOptions) {
    super(opts);

    if (opts?.auth) {
      this.exchange.apiKey = opts.auth.key;
      this.exchange.secret = opts.auth.secret;
    }
    if (opts?.sandbox) this.exchange.setSandboxMode(true);

    this.exchange.options['defaultType'] = 'swap';
    this.syncProxy();
  }

  public async getTicker({
    symbol,
  }: GetTikerOptions): Promise<TradekitResult<ccxt.Ticker>> {
    try {
      const tiker = await this.exchange.fetchTicker(symbol);
      return ok(tiker);
    } catch (e) {
      return err(handleError(e));
    } finally {
      this.syncProxy();
    }
  }

  public async getTickers({
    symbols,
  }: GetTikersOptions): Promise<TradekitResult<ccxt.Ticker[]>> {
    try {
      const tikers = await this.exchange.fetchTickers(symbols);
      return ok(Object.values(tikers));
    } catch (e) {
      return err(handleError(e));
    } finally {
      this.syncProxy();
    }
  }

  public subscribeToTicker(opts: SubscribeToTikerOptions): BinanceStreamClient {
    return new BinanceStreamClient({
      ...opts,
      symbols: [opts.symbol],
    });
  }

  public subscribeToTickers(
    opts: SubscribeToTikersOptions
  ): BinanceStreamClient {
    return new BinanceStreamClient({
      ...opts,
      symbols: [...opts.symbols],
    });
  }

  public async getBalance(
    opts?: GetBalanceOptions
  ): Promise<TradekitResult<ccxt.Balances>> {
    try {
      const balance = await this.exchange.fetchBalance();

      if (opts?.currencies) {
        const filtered: ccxt.Balances = {
          free: {} as ccxt.Balance,
          used: {} as ccxt.Balance,
          total: {} as ccxt.Balance,
          info: balance.info,
          datetime: balance.datetime,
        };

        for (const currency of opts.currencies) {
          if (currency in balance.free) {
            filtered.free[currency as keyof ccxt.Balance] =
              balance.free[currency as keyof ccxt.Balance];
            filtered.used[currency as keyof ccxt.Balance] =
              balance.used[currency as keyof ccxt.Balance];
            filtered.total[currency as keyof ccxt.Balance] =
              balance.total[currency as keyof ccxt.Balance];
          }
        }

        return ok(filtered);
      }

      return ok(balance);
    } catch (e) {
      return err(handleError(e));
    } finally {
      this.syncProxy();
    }
  }

  public async setLeverage(
    opts: SetLeverageOptions
  ): Promise<TradekitResult<number>> {
    try {
      if (opts.symbol === undefined) {
        return err({
          reason: 'TRADEKIT_ERROR',
          info: {
            code: 'BAD_SYMBOL',
            msg: 'Unable to set global leverage for binance. Please provide a symbol.',
          },
        });
      }
      await this.exchange.setLeverage(opts.leverage, opts.symbol);
      return ok(opts.leverage);
    } catch (e) {
      if (e instanceof ccxt.ExchangeError) {
        try {
          const payload = JSON.parse(e.message.replace('binance ', '')) as {
            retCode: number;
          };
          if (payload.retCode === 110043) {
            return ok(opts.leverage);
          }
          return err(handleError(e));
        } catch {
          return err(handleError(e));
        }
      }
      return err(handleError(e));
    } finally {
      this.syncProxy();
    }
  }

  public async openLong(
    opts: OpenPositionOptions
  ): Promise<TradekitResult<ccxt.Order>> {
    return this.openPosition(opts, 'buy');
  }

  public async openShort(
    opts: OpenPositionOptions
  ): Promise<TradekitResult<ccxt.Order>> {
    return this.openPosition(opts, 'sell');
  }

  private async openPosition(
    { symbol, amount, timeInForce }: OpenPositionOptions,
    side: 'buy' | 'sell'
  ): Promise<TradekitResult<ccxt.Order>> {
    try {
      const order = await this.exchange.createMarketOrder(symbol, side, amount);
      const startTime = Date.now();
      const timeOut = timeInForce ?? 30000;
      while (Date.now() - startTime < timeOut) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const orders = await this.exchange.fetchOpenOrders(symbol);
        if (orders.find(o => o.id === order.id) === undefined) {
          return ok(order);
        }
      }
      await this.exchange.cancelOrder(order.id);
      return err({
        reason: 'TRADEKIT_ERROR',
        info: {
          code: 'TIME_OUT',
          msg: 'The order was not filled in time.',
        },
      });
    } catch (e) {
      return err(handleError(e));
    } finally {
      this.syncProxy();
    }
  }

  public async closeLong(
    opts: ClosePositionOptions
  ): Promise<TradekitResult<ccxt.Order>> {
    return this.closePosition(opts, 'sell');
  }

  public async closeShort(
    opts: ClosePositionOptions
  ): Promise<TradekitResult<ccxt.Order>> {
    return this.closePosition(opts, 'buy');
  }

  private async closePosition(
    { symbol, amount, timeInForce }: ClosePositionOptions,
    side: 'buy' | 'sell'
  ): Promise<TradekitResult<ccxt.Order>> {
    try {
      const order = await this.exchange.createMarketOrder(
        symbol,
        side,
        amount,
        undefined,
        {
          reduceOnly: true,
        }
      );
      const startTime = Date.now();
      const timeOut = timeInForce ?? 30000;
      while (Date.now() - startTime < timeOut) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const orders = await this.exchange.fetchOpenOrders(symbol);
        if (orders.find(o => o.id === order.id) === undefined) {
          return ok(order);
        }
      }
      await this.exchange.cancelOrder(order.id);
      return err({
        reason: 'TRADEKIT_ERROR',
        info: {
          code: 'TIME_OUT',
          msg: 'The order was not filled in time.',
        },
      });
    } catch (e) {
      return err(handleError(e));
    } finally {
      this.syncProxy();
    }
  }

  private syncProxy() {
    this.rotateProxy();
    this.getCurrentProxy().match(
      proxy => {
        this.exchange = syncCCXTProxy(this.exchange, proxy);
      },
      () => (this.exchange.proxy = undefined)
    );
  }
}
