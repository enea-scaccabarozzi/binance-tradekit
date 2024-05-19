import { ok, err } from 'neverthrow';

import { TradekitAuth, TradekitOptions } from '../types/shared';
import { ProxyRotator } from './proxy';
import { TradekitResult } from '../types/shared/errors';
import { ProxyOptions } from '../types/shared/proxy';

export class BaseClass {
  protected auth?: TradekitAuth;
  protected http: ProxyRotator;
  protected sandbox: boolean;

  constructor(opts?: TradekitOptions) {
    this.auth = opts?.auth;
    this.sandbox = opts?.sandbox || false;
    this.http = new ProxyRotator({ proxies: opts?.proxies });
  }

  /* Auth */
  public setAuth(auth: TradekitAuth): boolean {
    this.auth = auth;
    return true;
  }

  public getAuth(): TradekitResult<TradekitAuth> {
    return this.auth
      ? ok(this.auth)
      : err({
          reason: 'TRADEKIT_ERROR',
          info: {
            code: 'AUHT_UNSET',
            msg: 'Unable to retrive auth object. Please set it one time before using this method.',
          },
        });
  }

  /* Sandbox */
  public setSandbox(sandbox: boolean): boolean {
    this.sandbox = sandbox;
    return this.sandbox;
  }

  /* Proxy Management */
  public addProxy(proxy: ProxyOptions): ProxyOptions {
    this.http.setProxies([...this.http.getProxies(), proxy]);
    return proxy;
  }

  public setProxies(proxies: ProxyOptions[]): number {
    this.http.setProxies(proxies);
    return proxies.length;
  }

  public getProxies(): TradekitResult<ProxyOptions[]> {
    const proxies = this.http.getProxies();
    return proxies.length > 0
      ? ok(proxies)
      : err({
          reason: 'TRADEKIT_ERROR',
          info: { code: 'PROXY_UNSET', msg: 'No proxies found.' },
        });
  }

  public getCurrentProxy(): TradekitResult<ProxyOptions> {
    const proxy = this.http.getCurrentProxy();
    return proxy
      ? ok(proxy)
      : err({
          reason: 'TRADEKIT_ERROR',
          info: { code: 'PROXY_UNSET', msg: 'No proxy found.' },
        });
  }

  public rotateProxy(): TradekitResult<ProxyOptions> {
    this.http.rotateProxy();
    const proxy = this.http.getCurrentProxy();
    return proxy
      ? ok(proxy)
      : err({
          reason: 'TRADEKIT_ERROR',
          info: { code: 'PROXY_UNSET', msg: 'No proxies found.' },
        });
  }
}
