import ccxt, { Ticker, Balance, Balances, ExchangeError, Order } from 'ccxt';
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
import { BybitStreamClient } from './websoket';
import { syncCCXTProxy } from '../shared/proxy/sync';

export class Bybit extends BaseClass implements Tradekit {
  protected exchange = new ccxt.bybit();

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
  }: GetTikerOptions): Promise<TradekitResult<Ticker>> {
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
  }: GetTikersOptions): Promise<TradekitResult<Ticker[]>> {
    try {
      const tikers = await this.exchange.fetchTickers(symbols);
      return ok(Object.values(tikers));
    } catch (e) {
      return err(handleError(e));
    } finally {
      this.syncProxy();
    }
  }

  public subscribeToTicker(opts: SubscribeToTikerOptions): BybitStreamClient {
    return new BybitStreamClient({
      ...opts,
      testnet: this.sandbox,
      symbols: [opts.symbol],
    });
  }

  public subscribeToTickers(opts: SubscribeToTikersOptions): BybitStreamClient {
    return new BybitStreamClient({
      ...opts,
      testnet: this.sandbox,
      symbols: [...opts.symbols],
    });
  }

  public async getBalance(
    opts?: GetBalanceOptions
  ): Promise<TradekitResult<Balances>> {
    try {
      const balance = await this.exchange.fetchBalance();

      if (opts?.currencies) {
        const filtered: Balances = {
          free: {} as Balance,
          used: {} as Balance,
          total: {} as Balance,
          debt: {} as Balance,
          info: balance.info,
          datetime: balance.datetime,
        };

        for (const currency of opts.currencies) {
          if (currency in balance.free) {
            filtered.free[currency as keyof Balance] =
              balance.free[currency as keyof Balance];
            filtered.used[currency as keyof Balance] =
              balance.used[currency as keyof Balance];
            filtered.total[currency as keyof Balance] =
              balance.total[currency as keyof Balance];
            filtered.debt[currency as keyof Balance] =
              balance.debt[currency as keyof Balance];
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
            msg: 'Unable to set global leverage for bybit. Please provide a symbol.',
          },
        });
      }
      await this.exchange.setLeverage(opts.leverage, opts.symbol);
      return ok(opts.leverage);
    } catch (e) {
      if (e instanceof ExchangeError) {
        try {
          const payload = JSON.parse(e.message.replace('bybit ', '')) as {
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
  ): Promise<TradekitResult<Order>> {
    return this.openPosition(opts, 'buy');
  }

  public async openShort(
    opts: OpenPositionOptions
  ): Promise<TradekitResult<Order>> {
    return this.openPosition(opts, 'sell');
  }

  private async openPosition(
    { symbol, amount, timeInForce }: OpenPositionOptions,
    side: 'buy' | 'sell'
  ): Promise<TradekitResult<Order>> {
    try {
      const order = await this.exchange.createMarketOrder(symbol, side, amount);
      const startTime = Date.now();
      const timeOut = timeInForce ?? 30000;
      while (Date.now() - startTime < timeOut) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const orders = await this.exchange.fetchOpenOrders();
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
  ): Promise<TradekitResult<Order>> {
    return this.closePosition(opts, 'sell');
  }

  public async closeShort(
    opts: ClosePositionOptions
  ): Promise<TradekitResult<Order>> {
    return this.closePosition(opts, 'buy');
  }

  private async closePosition(
    { symbol, amount, timeInForce }: ClosePositionOptions,
    side: 'buy' | 'sell'
  ): Promise<TradekitResult<Order>> {
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
        const orders = await this.exchange.fetchOpenOrders();
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
