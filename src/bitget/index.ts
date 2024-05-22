import ccxt from 'ccxt';
import { ok, err, Result } from 'neverthrow';

import { BaseClass } from '../shared/base';
import { Tradekit, TradekitOptions } from '../types/shared';
import {
  GetTikerOptions,
  GetTikersOptions,
  SubscribeToTikerOptions,
  SubscribeToTikersOptions,
  Ticker,
} from '../types/shared/tickers';
import { TradekitResult } from '../types/shared/errors';
import {
  CurrencyBalance,
  GetBalanceOptions,
  SetLeverageOptions,
  Balance,
} from '../types/shared/account';
import {
  ClosePositionOptions,
  OpenPositionOptions,
  Order,
} from '../types/shared/orders';
import { handleError } from './errors';
import { syncCCXTProxy } from '../shared/proxy/sync';
import { BitgetStreamClient } from './websoket';
import { ccxtTickerAdapter } from '../shared/adapters/ticker';
import { ccxtBalanceAdapter } from '../shared/adapters/balance';
import { ccxtOrderAdapter } from '../shared/adapters/order';
import { normalizeSymbol } from './utils';
import { BitgetOrderResponse } from '../types/bitget';

export class Bitget extends BaseClass implements Tradekit {
  protected exchange = new ccxt.bitget();

  constructor(opts?: TradekitOptions) {
    super(opts);

    if (opts?.auth) {
      this.exchange.apiKey = opts.auth.key;
      this.exchange.secret = opts.auth.secret;
      if (opts.auth.passphrase) this.exchange.password = opts.auth.passphrase;
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
      return ccxtTickerAdapter(tiker);
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
      const tikers = await Promise.all(
        symbols.map(s => this.exchange.fetchTicker(s))
      );
      const res = Object.values(tikers).map(ccxtTickerAdapter);
      return Result.combine(res);
    } catch (e) {
      return err(handleError(e));
    } finally {
      this.syncProxy();
    }
  }

  public subscribeToTicker(opts: SubscribeToTikerOptions): BitgetStreamClient {
    return new BitgetStreamClient({
      ...opts,
      symbols: [opts.symbol],
    });
  }

  public subscribeToTickers(
    opts: SubscribeToTikersOptions
  ): BitgetStreamClient {
    return new BitgetStreamClient({
      ...opts,
      symbols: [...opts.symbols],
    });
  }

  public async getBalance(
    opts?: GetBalanceOptions
  ): Promise<TradekitResult<Balance>> {
    try {
      const balance = ccxtBalanceAdapter(await this.exchange.fetchBalance());

      if (opts?.currencies) {
        const currencies = opts.currencies;
        const filteredCurrencies: { [currency: string]: CurrencyBalance } = {};
        for (const currency in balance.currencies) {
          if (currencies.includes(currency)) {
            filteredCurrencies[currency] = balance.currencies[currency];
          }
        }
        balance.currencies = filteredCurrencies;
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
            msg: 'Unable to set global leverage for bitget. Please provide a symbol.',
          },
        });
      }

      await this.exchange.privateMixPostV2MixAccountSetLeverage({
        symbol: normalizeSymbol(opts.symbol, this.sandbox),
        productType: `${this.sandbox ? 'S' : ''}USDT-FUTURES`,
        marginCoin: `${this.sandbox ? 'S' : ''}USDT`,
        leverage: 1,
        holdSide: 'long',
      });
      await this.exchange.privateMixPostV2MixAccountSetLeverage({
        symbol: normalizeSymbol(opts.symbol, this.sandbox),
        productType: `${this.sandbox ? 'S' : ''}USDT-FUTURES`,
        marginCoin: `${this.sandbox ? 'S' : ''}USDT`,
        leverage: 1,
        holdSide: 'short',
      });
      return ok(opts.leverage);
    } catch (e) {
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
      const order: BitgetOrderResponse =
        await this.exchange.privateMixPostV2MixOrderPlaceOrder({
          symbol: normalizeSymbol(symbol, this.sandbox),
          productType: `${this.sandbox ? 'S' : ''}USDT-FUTURES`,
          marginMode: 'isolated',
          marginCoin: `${this.sandbox ? 'S' : ''}USDT`,
          size: amount,
          side,
          orderType: 'market',
        });
      const startTime = Date.now();
      const timeOut = timeInForce ?? 30000;
      while (Date.now() - startTime < timeOut) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const orderStatus = await this.exchange.fetchOrder(
          order.data.orderId,
          symbol
        );
        if (orderStatus.remaining === 0) return ccxtOrderAdapter(orderStatus);
      }
      await this.exchange.cancelOrder(order.data.orderId, symbol);
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
      const order: BitgetOrderResponse =
        await this.exchange.privateMixPostV2MixOrderPlaceOrder({
          symbol: normalizeSymbol(symbol, this.sandbox),
          productType: `${this.sandbox ? 'S' : ''}USDT-FUTURES`,
          marginMode: 'isolated',
          marginCoin: `${this.sandbox ? 'S' : ''}USDT`,
          size: amount,
          side,
          orderType: 'market',
          reduceOnly: 'YES',
        });
      const startTime = Date.now();
      const timeOut = timeInForce ?? 30000;
      while (Date.now() - startTime < timeOut) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const orderStatus = await this.exchange.fetchOrder(
          order.data.orderId,
          symbol
        );
        if (orderStatus.remaining === 0) return ccxtOrderAdapter(orderStatus);
      }
      await this.exchange.cancelOrder(order.data.orderId, symbol);
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
    this.rotateProxy().match(
      proxy => {
        this.exchange = syncCCXTProxy(this.exchange, proxy);
      },
      () => (this.exchange.proxy = undefined)
    );
  }
}
