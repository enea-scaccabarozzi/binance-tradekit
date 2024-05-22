import { Order as CCXTOrder } from 'ccxt';
import { err, ok } from 'neverthrow';

import { Order } from '../../types/shared/orders';
import { TradekitResult } from '../../types/shared/errors';
import { createError } from './shared';

export function ccxtOrderAdapter(ccxtOrder: CCXTOrder): TradekitResult<Order> {
  let status: 'new' | 'filled' | 'canceled';
  switch (ccxtOrder.status) {
    case 'open':
      status = 'new';
      break;
    case 'closed':
      status = 'filled';
      break;
    case 'canceled':
      status = 'canceled';
      break;
    default:
      return err(createError('Unknown order status'));
  }

  if (
    !ccxtOrder.type ||
    !['market', 'limit', 'stop', 'stop-limit'].includes(ccxtOrder.type)
  )
    return err(createError('Unknown order type'));

  if (!ccxtOrder.side || !['buy', 'sell'].includes(ccxtOrder.side))
    return err(createError('Unknown order side'));

  return ok({
    orderId: ccxtOrder.id,
    symbol: ccxtOrder.symbol,
    price: ccxtOrder.price,
    quantity: ccxtOrder.amount,
    orderType: ccxtOrder.type as 'market' | 'limit' | 'stop' | 'stop-limit',
    side: ccxtOrder.side as 'buy' | 'sell',
    status: status,
    timestamp: ccxtOrder.timestamp,
    datetime: new Date(ccxtOrder.datetime),
    clientOrderId: ccxtOrder.clientOrderId,
  });
}
