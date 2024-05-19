import { AxiosInstance } from 'axios';

export interface ProxyOptions {
  host: string;
  port: number;
  auth?: ProxyAuth;
  protocol?: ProxyProtocol;
}

export interface ProxyAuth {
  username: string;
  password: string;
}

export type ProxyProtocol = 'http' | 'https' | 'socks4' | 'socks5';

export interface ProxyRotatorOptions {
  proxies?: ProxyOptions[];
  baseInstance?: AxiosInstance;
}
