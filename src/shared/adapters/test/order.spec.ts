import { describe, it, expect } from 'vitest';
import { Order as CCXTOrder } from 'ccxt';

import { createError } from '../shared';
import { Order } from '../../../types/shared/orders';
import { TradekitResult } from '../../../types/shared/errors';
import { ccxtOrderAdapter } from '../order';

describe('ccxtOrderAdapter', () => {
  it('should return an error for unknown order status', () => {
    const ccxtOrder = {
      status: 'invalid',
      type: 'limit',
      side: 'buy',
      id: '1',
      symbol: 'BTC/USD',
      price: 50000,
      amount: 1,
      timestamp: 1625260800000,
      datetime: '2021-07-03T00:00:00Z',
      clientOrderId: 'client-id',
    };

    // eslint-disable-next-line neverthrow/must-use-result
    const result: TradekitResult<Order> = ccxtOrderAdapter(
      ccxtOrder as CCXTOrder
    );

    expect(result._unsafeUnwrapErr()).toEqual(
      createError('Unknown order status')
    );
  });

  it('should return an error for unknown order type', () => {
    const ccxtOrder = {
      status: 'open',
      type: 'unknown',
      side: 'buy',
      id: '1',
      symbol: 'BTC/USD',
      price: 50000,
      amount: 1,
      timestamp: 1625260800000,
      datetime: '2021-07-03T00:00:00Z',
      clientOrderId: 'client-id',
    };

    // eslint-disable-next-line neverthrow/must-use-result
    const result: TradekitResult<Order> = ccxtOrderAdapter(
      ccxtOrder as CCXTOrder
    );

    expect(result._unsafeUnwrapErr()).toEqual(
      createError('Unknown order type')
    );
  });

  it('should return an error for unknown order side', () => {
    const ccxtOrder = {
      status: 'open',
      type: 'limit',
      side: 'unknown',
      id: '1',
      symbol: 'BTC/USD',
      price: 50000,
      amount: 1,
      timestamp: 1625260800000,
      datetime: '2021-07-03T00:00:00Z',
      clientOrderId: 'client-id',
    };

    // eslint-disable-next-line neverthrow/must-use-result
    const result: TradekitResult<Order> = ccxtOrderAdapter(
      ccxtOrder as CCXTOrder
    );

    expect(result._unsafeUnwrapErr()).toEqual(
      createError('Unknown order side')
    );
  });

  it('should convert a valid CCXT order to internal order format', () => {
    const ccxtOrder = {
      status: 'open',
      type: 'limit',
      side: 'buy',
      id: '1',
      symbol: 'BTC/USD',
      price: 50000,
      amount: 1,
      timestamp: 1625260800000,
      datetime: '2021-07-03T00:00:00Z',
      clientOrderId: 'client-id',
    };

    const expectedOrder = {
      orderId: '1',
      symbol: 'BTC/USD',
      price: 50000,
      quantity: 1,
      orderType: 'limit',
      side: 'buy',
      status: 'new',
      timestamp: 1625260800000,
      datetime: new Date('2021-07-03T00:00:00Z'),
      clientOrderId: 'client-id',
    };

    const result: TradekitResult<Order> = ccxtOrderAdapter(
      ccxtOrder as CCXTOrder
    );

    expect(result._unsafeUnwrap()).toEqual(expectedOrder);
  });

  it('should convert an order with status closed to status filled', () => {
    const ccxtOrder = {
      status: 'closed',
      type: 'limit',
      side: 'sell',
      id: '2',
      symbol: 'ETH/USD',
      price: 3000,
      amount: 2,
      timestamp: 1625260900000,
      datetime: '2021-07-03T00:15:00Z',
      clientOrderId: 'client-id-2',
    };

    const expectedOrder = {
      orderId: '2',
      symbol: 'ETH/USD',
      price: 3000,
      quantity: 2,
      orderType: 'limit',
      side: 'sell',
      status: 'filled',
      timestamp: 1625260900000,
      datetime: new Date('2021-07-03T00:15:00Z'),
      clientOrderId: 'client-id-2',
    };

    const result: TradekitResult<Order> = ccxtOrderAdapter(
      ccxtOrder as CCXTOrder
    );

    expect(result._unsafeUnwrap()).toEqual(expectedOrder);
  });

  it('should convert an order with status canceled to status canceled', () => {
    const ccxtOrder = {
      status: 'canceled',
      type: 'limit',
      side: 'buy',
      id: '3',
      symbol: 'LTC/USD',
      price: 200,
      amount: 5,
      timestamp: 1625261000000,
      datetime: '2021-07-03T00:30:00Z',
      clientOrderId: 'client-id-3',
    };

    const expectedOrder = {
      orderId: '3',
      symbol: 'LTC/USD',
      price: 200,
      quantity: 5,
      orderType: 'limit',
      side: 'buy',
      status: 'canceled',
      timestamp: 1625261000000,
      datetime: new Date('2021-07-03T00:30:00Z'),
      clientOrderId: 'client-id-3',
    };

    const result: TradekitResult<Order> = ccxtOrderAdapter(
      ccxtOrder as CCXTOrder
    );

    expect(result._unsafeUnwrap()).toEqual(expectedOrder);
  });
});
