import { describe, it, expect, beforeEach } from 'vitest';
import { ok, err } from 'neverthrow';

import { BaseClass } from './base'; // update the path accordingly
import { TradekitAuth } from '../types/shared';
import { ProxyOptions } from '../types/shared/proxy';

describe('BaseClass', () => {
  let baseClass: BaseClass;
  let proxies: ProxyOptions[];

  beforeEach(() => {
    proxies = [
      { host: 'proxy1.com', port: 8080 },
      { host: 'proxy2.com', port: 8080 },
    ];

    baseClass = new BaseClass({
      auth: { key: 'test-api-key', secret: 'test-secret' },
      sandbox: true,
      proxies,
    });
  });

  describe('Auth methods', () => {
    describe('setAuth', () => {
      it('should set auth correctly', () => {
        const auth: TradekitAuth = { key: 'new-api-key', secret: 'new-secret' };
        expect(baseClass.setAuth(auth)).toBe(true);
        expect(baseClass.getAuth()).toEqual(ok(auth));
      });
    });

    describe('getAuth', () => {
      it('should return auth when set', () => {
        expect(baseClass.getAuth()).toEqual(
          ok({ key: 'test-api-key', secret: 'test-secret' })
        );
      });

      it('should return error if auth is not set', () => {
        const newBaseClass = new BaseClass();
        expect(newBaseClass.getAuth()).toMatchObject(
          err({
            reason: 'TRADEKIT_ERROR',
            info: {
              code: 'AUHT_UNSET',
            },
          })
        );
      });
    });
  });

  describe('Sandbox methods', () => {
    describe('setSandbox', () => {
      it('should set sandbox to true', () => {
        expect(baseClass.setSandbox(true)).toBe(true);
      });

      it('should set sandbox to false', () => {
        expect(baseClass.setSandbox(false)).toBe(false);
      });
    });
  });

  describe('Proxy Management methods', () => {
    describe('addProxy', () => {
      it('should add a proxy correctly', () => {
        const newProxy: ProxyOptions = { host: 'proxy3.com', port: 8080 };
        expect(baseClass.addProxy(newProxy)).toEqual(newProxy);
        expect(baseClass.getProxies()._unsafeUnwrap()).toContain(newProxy);
      });
    });

    describe('setProxies', () => {
      it('should set proxies correctly', () => {
        const newProxies: ProxyOptions[] = [
          { host: 'proxy4.com', port: 8080 },
          { host: 'proxy5.com', port: 8080 },
        ];
        expect(baseClass.setProxies(newProxies)).toBe(newProxies.length);
        expect(baseClass.getProxies()).toEqual(ok(newProxies));
      });
    });

    describe('getProxies', () => {
      it('should return proxies when they are set', () => {
        expect(baseClass.getProxies()).toEqual(ok(proxies));
      });

      it('should return error if no proxies are found', () => {
        const newBaseClass = new BaseClass();
        expect(newBaseClass.getProxies()).toMatchObject(
          err({
            reason: 'TRADEKIT_ERROR',
            info: { code: 'PROXY_UNSET' },
          })
        );
      });
    });

    describe('getCurrentProxy', () => {
      it('should get the current proxy correctly', () => {
        expect(baseClass.getCurrentProxy()).toEqual(ok(proxies[0]));
        baseClass.rotateProxy();
        expect(baseClass.getCurrentProxy()).toEqual(ok(proxies[1]));
      });

      it('should return error if no current proxy is found', () => {
        const newBaseClass = new BaseClass();
        expect(newBaseClass.getCurrentProxy()).toMatchObject(
          err({
            reason: 'TRADEKIT_ERROR',
            info: { code: 'PROXY_UNSET' },
          })
        );
      });
    });

    describe('rotateProxy', () => {
      it('should rotate proxies correctly', () => {
        baseClass.rotateProxy();
        expect(baseClass.getCurrentProxy()).toEqual(ok(proxies[1]));
      });

      it('should wrap around to the first proxy', () => {
        expect(baseClass.getCurrentProxy()).toEqual(ok(proxies[0]));
        baseClass.rotateProxy();
        expect(baseClass.getCurrentProxy()).toEqual(ok(proxies[1]));
        baseClass.rotateProxy();
        expect(baseClass.getCurrentProxy()).toEqual(ok(proxies[0]));
      });

      it('should return error if no proxies to rotate', () => {
        const newBaseClass = new BaseClass();
        expect(newBaseClass.rotateProxy()).toMatchObject(
          err({
            reason: 'TRADEKIT_ERROR',
            info: { code: 'PROXY_UNSET' },
          })
        );
      });
    });
  });
});
