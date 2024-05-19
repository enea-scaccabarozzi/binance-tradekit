import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  Method,
} from 'axios';

import { ProxyOptions, ProxyRotatorOptions } from '../../types/shared/proxy';

export class ProxyRotator {
  private http: AxiosInstance = axios;
  private proxies: ProxyOptions[] = [];
  private currentProxyIndex = 0;

  constructor({ proxies, baseInstance }: ProxyRotatorOptions) {
    if (baseInstance) this.http = baseInstance;
    if (proxies) this.proxies = proxies;
  }

  private async request<T = unknown>(
    method: Method,
    url: string,
    config: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<T>> {
    const proxyConfig: AxiosRequestConfig = { proxy: this.getCurrentProxy() };

    // Combine user config with proxy configuration
    const finalConfig = { ...proxyConfig, ...config, method, url };

    // eslint-disable-next-line no-useless-catch
    try {
      const response = await this.http(finalConfig);
      this.rotateProxy();
      return response;
    } catch (e) {
      throw e;
    }
  }

  public get<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.request<T>('get', url, config);
  }

  public post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.request<T>('post', url, { ...config, data });
  }

  public put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.request<T>('put', url, { ...config, data });
  }

  public delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.request<T>('delete', url, config);
  }

  public setProxies(proxies: ProxyOptions[]): void {
    this.proxies = proxies;
    this.currentProxyIndex = 0;
  }

  public getCurrentProxy(): ProxyOptions | undefined {
    if (this.proxies.length === 0) {
      return undefined;
    }
    return this.proxies[this.currentProxyIndex];
  }

  public getProxies(): ProxyOptions[] {
    return this.proxies;
  }

  public replaceBaseInstance(baseInstance: AxiosInstance): void {
    this.http = baseInstance;
  }

  public getBaseInstance(): AxiosInstance {
    return this.http;
  }

  public rotateProxy(): void {
    const nextIndex = (this.currentProxyIndex + 1) % this.proxies.length;
    this.currentProxyIndex = nextIndex;
  }
}
