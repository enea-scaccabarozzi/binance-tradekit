import { AxiosInstance } from 'axios';

export interface IProxyOptions {
  host: string;
  port: number;
  auth?: IProxyAuth;
  protocol?: IProxyProtocol;
}

export interface IProxyAuth {
  username: string;
  password: string;
}

export type IProxyProtocol = 'http' | 'https' | 'socks4' | 'socks5';

export interface IProxyRotatorOptions {
  proxies?: IProxyOptions[];
  baseInstance?: AxiosInstance;
}
