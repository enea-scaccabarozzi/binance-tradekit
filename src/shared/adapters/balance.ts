import { Balances as CCXTBalance } from 'ccxt';

import { Balance, CurrencyBalance } from '../../types/shared/account';

export function ccxtBalanceAdapter(ccxtBalances: CCXTBalance): Balance {
  const currencies: { [currency: string]: CurrencyBalance } = {};

  for (const currency in ccxtBalances) {
    if (
      currency !== 'info' &&
      currency !== 'timestamp' &&
      currency !== 'datetime'
    ) {
      const balance = ccxtBalances[currency];
      if (
        balance &&
        (balance.free !== undefined ||
          balance.used !== undefined ||
          balance.total !== undefined)
      ) {
        currencies[currency] = {
          free: balance.free || 0,
          used: balance.used || 0,
          total: balance.total || 0,
        };
      }
    }
  }

  return {
    currencies: currencies,
    timestamp: new Date().getTime(),
    datetime: new Date(),
  };
}
