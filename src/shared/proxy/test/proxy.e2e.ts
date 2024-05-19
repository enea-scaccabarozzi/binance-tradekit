import { describe, it, expect, beforeEach } from 'vitest';
import 'dotenv/config';

import { ProxyRotator } from '../index';
import { ProxyOptions, ProxyProtocol } from '../../../types/shared/proxy';

const parseProxyUrl = (url: string): ProxyOptions => {
  const parsedUrl = new URL(url);
  return {
    protocol: parsedUrl.protocol.slice(0, -1) as ProxyProtocol,
    host: parsedUrl.hostname,
    port: Number(parsedUrl.port),
    auth: {
      username: parsedUrl.username,
      password: parsedUrl.password,
    },
  };
};

describe('ProxyRotator Integration Test', () => {
  let proxyRotator: ProxyRotator;

  beforeEach(() => {
    const proxies = [
      parseProxyUrl(process.env.PROXY_URL_1 as string),
      parseProxyUrl(process.env.PROXY_URL_2 as string),
    ];

    proxyRotator = new ProxyRotator({ proxies });
  });

  const checkIp = async () => {
    try {
      const response = await proxyRotator.get<{ ip: string }>(
        'https://api.ipify.org?format=json'
      );
      proxyRotator.rotateProxy();
      return response.data.ip;
    } catch (error) {
      console.error('Error fetching IP:', error);
      throw error;
    }
  };

  it('should hide IP address when using proxy', async () => {
    const hidden = await checkIp();
    proxyRotator.setProxies([]);
    const real = await checkIp();
    expect(hidden).not.toMatch(real);
  });

  describe('get', () => {
    it('should fetch data using GET request without proxy', async () => {
      const response = await proxyRotator.get(
        'https://api.ipify.org?format=json',
        { proxy: false }
      );
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('ip');
    });

    it('should fetch data using GET request and change IP after rotating proxy', async () => {
      const ip1 = await checkIp();
      proxyRotator.rotateProxy();
      const ip2 = await checkIp();
      expect(ip1).not.toBe(ip2);
    });
  });

  describe('post', () => {
    it('should send data using POST request without proxy', async () => {
      const response = await proxyRotator.post(
        'https://jsonplaceholder.typicode.com/posts',
        {
          title: 'foo',
          body: 'bar',
          userId: 1,
        },
        { proxy: false }
      );
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
    });

    it('should send data using POST request and change IP after rotating proxy', async () => {
      const ip1 = await checkIp();
      const response = await proxyRotator.post(
        'https://jsonplaceholder.typicode.com/posts',
        {
          title: 'foo',
          body: 'bar',
          userId: 1,
        }
      );
      const ip2 = await checkIp();
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(ip1).not.toBe(ip2);
    });
  });

  describe('put', () => {
    it('should update data using PUT request without proxy', async () => {
      const response = await proxyRotator.put(
        'https://jsonplaceholder.typicode.com/posts/1',
        {
          id: 1,
          title: 'foo',
          body: 'bar',
          userId: 1,
        },
        { proxy: false }
      );
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', 1);
    });

    it('should update data using PUT request and change IP after rotating proxy', async () => {
      const ip1 = await checkIp();
      const response = await proxyRotator.put(
        'https://jsonplaceholder.typicode.com/posts/1',
        {
          id: 1,
          title: 'foo',
          body: 'bar',
          userId: 1,
        }
      );
      const ip2 = await checkIp();
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', 1);
      expect(ip1).not.toBe(ip2);
    });
  });

  describe('delete', () => {
    it('should delete data using DELETE request without proxy', async () => {
      const response = await proxyRotator.delete(
        'https://jsonplaceholder.typicode.com/posts/1',
        { proxy: false }
      );
      expect(response.status).toBe(200);
    });

    it('should delete data using DELETE request and change IP after rotating proxy', async () => {
      const ip1 = await checkIp();
      const response = await proxyRotator.delete(
        'https://jsonplaceholder.typicode.com/posts/1'
      );
      const ip2 = await checkIp();
      expect(response.status).toBe(200);
      expect(ip1).not.toBe(ip2);
    });
  });
});
