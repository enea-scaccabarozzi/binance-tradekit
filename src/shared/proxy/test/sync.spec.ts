import { describe, it, expect } from 'vitest';
import { Exchange } from 'ccxt';
import { syncCCXTProxy } from '../sync';
import { ProxyOptions } from '../../../types/shared/proxy';

describe('syncCCXTProxy', () => {
  it('should set httpProxy without auth', () => {
    const mockExchange = { httpProxy: '', headers: {} } as unknown as Exchange;
    const proxy: ProxyOptions = { host: 'proxyhost', port: 8080 };

    const result = syncCCXTProxy(mockExchange, proxy);

    expect(result.httpProxy).toBe('http://proxyhost:8080');
    expect(result.headers).toEqual({});
  });

  it('should set httpProxy and headers with auth', () => {
    const mockExchange = { httpProxy: '', headers: {} } as unknown as Exchange;
    const proxy: ProxyOptions = {
      host: 'proxyhost',
      port: 8080,
      auth: { username: 'user', password: 'pass' },
    };

    const result = syncCCXTProxy(mockExchange, proxy);

    expect(result.httpProxy).toBe('http://proxyhost:8080');
    const expectedAuth = Buffer.from('user:pass').toString('base64');
    expect(result.headers).toEqual({
      'Proxy-Authorization': `Basic ${expectedAuth}`,
    });
  });

  it('should update headers if they already exist', () => {
    const mockExchange = {
      httpProxy: '',
      headers: { 'Some-Header': 'value' },
    } as unknown as Exchange;
    const proxy: ProxyOptions = {
      host: 'proxyhost',
      port: 8080,
      auth: { username: 'user', password: 'pass' },
    };

    const result = syncCCXTProxy(mockExchange, proxy);

    expect(result.httpProxy).toBe('http://proxyhost:8080');
    const expectedAuth = Buffer.from('user:pass').toString('base64');
    expect(result.headers).toEqual({
      'Some-Header': 'value',
      'Proxy-Authorization': `Basic ${expectedAuth}`,
    });
  });

  it('should not override existing headers if auth is undefined', () => {
    const mockExchange = {
      httpProxy: '',
      headers: { 'Some-Header': 'value' },
    } as unknown as Exchange;
    const proxy: ProxyOptions = { host: 'proxyhost', port: 8080 };

    const result = syncCCXTProxy(mockExchange, proxy);

    expect(result.httpProxy).toBe('http://proxyhost:8080');
    expect(result.headers).toEqual({ 'Some-Header': 'value' });
  });
});
