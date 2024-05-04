import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ProxyRotator } from '.';
import axios from 'axios';

vi.mock('axios', () => ({ default: vi.fn() }));

describe('ProxyRotator', () => {
  const testProxies = [
    { host: '127.0.0.1', port: 8080 },
    { host: '127.0.0.2', port: 8081 },
  ];

  describe('constructor', () => {
    it('should initialize with an empty proxy list if no proxies are provided', () => {
      const rotator = new ProxyRotator({});
      expect(rotator.getProxies()).toEqual([]);
    });

    it('should initialize with given proxies', () => {
      const rotator = new ProxyRotator({ proxies: testProxies });
      expect(rotator.getProxies()).toEqual(testProxies);
    });

    it('should initialize with the given base instance', () => {
      const baseInstance = axios;
      const rotator = new ProxyRotator({ proxies: testProxies, baseInstance });
      expect(rotator.getBaseInstance()).toBe(baseInstance);
    });
  });

  describe('rotateProxy', () => {
    it('should rotate proxies correctly', () => {
      const rotator = new ProxyRotator({ proxies: testProxies });
      expect(rotator.getCurrentProxy()).toEqual(testProxies[0]);
      rotator['rotateProxy']();
      expect(rotator.getCurrentProxy()).toEqual(testProxies[1]);
    });

    it('should rotate back to the first proxy after the last one', () => {
      const rotator = new ProxyRotator({ proxies: testProxies });
      rotator['rotateProxy']();
      rotator['rotateProxy']();
      expect(rotator.getCurrentProxy()).toEqual(testProxies[0]);
    });
  });

  describe('HTTP Methods', () => {
    let rotator: ProxyRotator;

    beforeEach(() => {
      rotator = new ProxyRotator({ proxies: testProxies });
      vi.mocked(axios).mockClear();
    });

    it('should handle a GET request using the first proxy and rotate if successful', async () => {
      vi.mocked(axios).mockResolvedValue({ status: 200, data: 'response' });

      expect(rotator.getCurrentProxy()).toEqual(testProxies[0]);
      const firstResponse = await rotator.get('http://example.com');
      expect(vi.mocked(axios)).toHaveBeenCalledTimes(1);
      expect(firstResponse.status).toBe(200);
      expect(firstResponse.data).toBe('response');
      expect(rotator.getCurrentProxy()).toEqual(testProxies[1]);

      vi.mocked(axios).mockRejectedValue(new Error());

      void expect(() =>
        rotator.get('http://example.com')
      ).rejects.toThrowError();
      expect(rotator.getCurrentProxy()).toEqual(testProxies[1]);
      expect(vi.mocked(axios)).toHaveBeenCalledTimes(2);
    });

    it('should handle a POST request using the first proxy and rotate if successful', async () => {
      vi.mocked(axios).mockResolvedValue({ status: 200, data: 'response' });

      expect(rotator.getCurrentProxy()).toEqual(testProxies[0]);
      const firstResponse = await rotator.post('http://example.com');
      expect(vi.mocked(axios)).toHaveBeenCalledTimes(1);
      expect(firstResponse.status).toBe(200);
      expect(firstResponse.data).toBe('response');
      expect(rotator.getCurrentProxy()).toEqual(testProxies[1]);

      vi.mocked(axios).mockRejectedValue(new Error());

      void expect(() =>
        rotator.post('http://example.com')
      ).rejects.toThrowError();
      expect(rotator.getCurrentProxy()).toEqual(testProxies[1]);
      expect(vi.mocked(axios)).toHaveBeenCalledTimes(2);
    });

    it('should handle a PUT request using the first proxy and rotate if successful', async () => {
      vi.mocked(axios).mockResolvedValue({ status: 200, data: 'response' });

      expect(rotator.getCurrentProxy()).toEqual(testProxies[0]);
      const firstResponse = await rotator.put('http://example.com');
      expect(vi.mocked(axios)).toHaveBeenCalledTimes(1);
      expect(firstResponse.status).toBe(200);
      expect(firstResponse.data).toBe('response');
      expect(rotator.getCurrentProxy()).toEqual(testProxies[1]);

      vi.mocked(axios).mockRejectedValue(new Error());

      void expect(() =>
        rotator.put('http://example.com')
      ).rejects.toThrowError();
      expect(rotator.getCurrentProxy()).toEqual(testProxies[1]);
      expect(vi.mocked(axios)).toHaveBeenCalledTimes(2);
    });

    it('should handle a DELETE request using the first proxy and rotate if successful', async () => {
      vi.mocked(axios).mockResolvedValue({ status: 200, data: 'response' });

      expect(rotator.getCurrentProxy()).toEqual(testProxies[0]);
      const firstResponse = await rotator.delete('http://example.com');
      expect(vi.mocked(axios)).toHaveBeenCalledTimes(1);
      expect(firstResponse.status).toBe(200);
      expect(firstResponse.data).toBe('response');
      expect(rotator.getCurrentProxy()).toEqual(testProxies[1]);

      vi.mocked(axios).mockRejectedValue(new Error());

      void expect(() =>
        rotator.delete('http://example.com')
      ).rejects.toThrowError();
      expect(rotator.getCurrentProxy()).toEqual(testProxies[1]);
      expect(vi.mocked(axios)).toHaveBeenCalledTimes(2);
    });
  });

  describe('setProxies', () => {
    it('should set proxies and reset currentProxyIndex', () => {
      const rotator = new ProxyRotator({ proxies: testProxies });
      const newProxies = [{ host: '127.0.0.3', port: 8082 }];
      rotator.setProxies(newProxies);
      expect(rotator.getProxies()).toEqual(newProxies);
      expect(rotator.getCurrentProxy()).toEqual(newProxies[0]);
    });
  });

  describe('replaceBaseInstance', () => {
    it('should replace the axios base instance', () => {
      const newAxiosInstance = axios;
      const rotator = new ProxyRotator({ proxies: testProxies });
      rotator.replaceBaseInstance(newAxiosInstance);
      expect(rotator.getBaseInstance()).toBe(newAxiosInstance);
    });
  });

  describe('getCurrentProxy', () => {
    it('should return the current proxy', () => {
      const rotator = new ProxyRotator({ proxies: testProxies });
      expect(rotator.getCurrentProxy()).toEqual(testProxies[0]);
    });

    it('should return undefined if no proxies are set', () => {
      const rotator = new ProxyRotator({});
      expect(rotator.getCurrentProxy()).toBeUndefined();
    });
  });
});
