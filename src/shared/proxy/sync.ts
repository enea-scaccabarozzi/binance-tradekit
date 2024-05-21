import { Exchange } from 'ccxt';

import { ProxyOptions } from '../../types/shared/proxy';

export const syncCCXTProxy = <T extends Exchange>(
  exchange: T,
  proxy: ProxyOptions
): T => {
  exchange.httpProxy = `http://${proxy.host}:${proxy.port}`;
  if (proxy.auth === undefined) return exchange;
  const auth = Buffer.from(
    `${proxy.auth.username}:${proxy.auth.password}`
  ).toString('base64');
  exchange.headers = {
    ...exchange.headers,
    'Proxy-Authorization': `Basic ${auth}`,
  };

  return exchange;
};
