# Tradekits

[![npm package][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]
[![Code Coverage][codecov-img]][codecov-url]
[![Commitizen Friendly][commitizen-img]][commitizen-url]
[![Semantic Release][semantic-release-img]][semantic-release-url]

> A small library to interact with some cryptocurrency exchanges in a way that is convenient for my projects.
> Please note that this projects is suited for my very specific needs and it's not meant to be a general purpose library.
> If you find it useful, feel free to use it, but be aware that it may not cover all the features you need.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Proxy Management](#proxy-management)
  - [Authentication](#authentication)
  - [Sandbox](#sandbox)
  - [Market Data](#market-data)
  - [Account Data](#account-data)
  - [Position Management](#position-management)
- [Interfaces](#interfaces)

## Installation

To install Tradekit, run:

```bash
npm install @enea-scaccabarozzi/tradekits
```

## Usage

```ts
import { Binance, Bybit } from '@enea-scaccabarozzi/tradekits';

const exchange = new Binance({
    proxies: [{
        host: "string",
        port: "number",
        auth: { username: undefined, password: undefined },
        protocol: undefined;
    }];
  sandbox: true;
  auth: { key: "string", secret: "string" };
})
```

The Tradekit API allows you to manage proxies, authenticate, access market data, and handle account and position management within a trading environment. This README provides an overview of the available methods and options for interacting with the Tradekit API.

### Proxy Management

Manage the proxies used by Tradekit for network requests.

- **addProxy(proxy: ProxyOptions): ProxyOptions**
  Adds a proxy configuration and returns the added proxy options.

- **setProxies(proxies: ProxyOptions[]): number**
  Sets multiple proxies and returns the number of proxies set.

- **getProxies(): TradekitResult<ProxyOptions[]>**
  Retrieves the list of configured proxies.

- **getCurrentProxy(): TradekitResult<ProxyOptions>**
  Retrieves the currently active proxy.

- **rotateProxy(): TradekitResult<ProxyOptions>**
  Rotates to the next proxy in the list and returns the new active proxy.

### Authentication

Manage authentication for accessing trading services.

- **setAuth(auth: TradekitAuth): boolean**
  Sets the authentication credentials and returns a boolean indicating success.

- **getAuth(): TradekitResult<TradekitAuth>**
  Retrieves the current authentication credentials.

### Sandbox

Enable or disable the sandbox mode for testing without affecting real accounts.

- **setSandbox(sandbox: boolean): boolean**
  Sets the sandbox mode and returns a boolean indicating if it was successfully set.

### Market Data

Access market data such as ticker information.

- **getTicker(opts: GetTikerOptions): Promise<TradekitResult<Ticker>>**
  Retrieves the ticker data for a specified symbol.

- **getTickers(opts: GetTikersOptions): Promise<TradekitResult<Ticker[]>>**
  Retrieves ticker data for multiple symbols.

- **subscribeToTicker(opts: SubscribeToTikerOptions): TradekitResult<never>**
  Subscribes to updates for a specified ticker.

- **subscribeToTickers(opts: SubscribeToTikersOptions): TradekitResult<never>**
  Subscribes to updates for multiple tickers.

### Account Data

Manage and retrieve account-related data.

- **getBalance(opts?: GetBalanceOptions): Promise<TradekitResult<Balances>>**
  Retrieves the balance for specified currencies.

- **setLeverage(opts: SetLeverageOptions): Promise<TradekitResult<number>>**
  Sets the leverage for trading and returns the new leverage.

### Position Management

Open and close trading positions.

- **openShort(opts: OpenPositionOptions): Promise<TradekitResult<Order>>**
  Opens a short position with specified options.

- **closeShort(opts: ClosePositionOptions): Promise<TradekitResult<Order>>**
  Closes a short position with specified options.

- **openLong(opts: OpenPositionOptions): Promise<TradekitResult<Order>>**
  Opens a long position with specified options.

- **closeLong(opts: ClosePositionOptions): Promise<TradekitResult<Order>>**
  Closes a long position with specified options.

## Interfaces

### ProxyOptions

Defines the configuration for a proxy.

### TradekitAuth

Defines the authentication credentials.

### GetTikerOptions

Options for retrieving a single ticker.

```typescript
export interface GetTikerOptions {
  symbol: string;
}
```

### SubscribeToTikerOptions

Options for subscribing to a single ticker, extending `GetTikerOptions`.

```typescript
export type SubscribeToTikerOptions = GetTikerOptions & BaseSubscriptionOptions<Ticker>;
```

### GetTikersOptions

Options for retrieving multiple tickers.

```typescript
export interface GetTikersOptions {
  symbols: string[];
}
```

### SubscribeToTikersOptions

Options for subscribing to multiple tickers, extending `GetTikersOptions`.

```typescript
export type SubscribeToTikersOptions = GetTikersOptions & BaseSubscriptionOptions<Ticker[]>;
```

### GetBalanceOptions

Options for retrieving account balances.

```typescript
export interface GetBalanceOptions {
  currencies?: string[];
}
```

### SetLeverageOptions

Options for setting trading leverage.

```typescript
export interface SetLeverageOptions {
  leverage: number;
  symbol?: string;
}
```

### OpenPositionOptions

Options for opening a trading position.

```typescript
export interface OpenPositionOptions {
  symbol: string;
  amount: number;
  timeInForce?: number;
}
```

### ClosePositionOptions

Options for closing a trading position.

```typescript
export interface ClosePositionOptions {
  symbol: string;
  amount: number;
  timeInForce?: number;
}
```

### BaseSubscriptionOptions<T>

Base options for subscribing to updates, with generic type `T`.

```typescript
export interface BaseSubscriptionOptions<T> {
  onUpdate: (data: T) => void | Promise<void>;
  onConnect?: () => void | Promise<void>;
  onClose?: () => void | Promise<void>;
  onSubscribed?: () => void | Promise<void>;
  onError?: (error: TradekitError) => void | Promise<void>;
}
```

### TradekitResult<T>

Generic result type used by many Tradekit methods. It wraps the result data and any errors that may have occurred.
See [neverthrow](https://github.com/supermacro/neverthrow) for more information about this approach.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or new features.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

[build-img]:https://github.com/enea-scaccabarozzi/tradekits/actions/workflows/release.yml/badge.svg
[build-url]:https://github.com/enea-scaccabarozzi/tradekits/actions/workflows/release.yml
[downloads-img]:https://img.shields.io/npm/dt/tradekits
[downloads-url]:https://www.npmtrends.com/tradekits
[npm-img]:https://img.shields.io/npm/v/tradekits
[npm-url]:https://www.npmjs.com/package/@enea-scaccabarozzi/tradekits
[issues-img]:https://img.shields.io/github/issues/enea-scaccabarozzi/tradekits
[issues-url]:https://github.com/enea-scaccabarozzi/tradekits/issues
[codecov-img]:https://codecov.io/gh/enea-scaccabarozzi/tradekits/branch/main/graph/badge.svg
[codecov-url]:https://codecov.io/gh/enea-scaccabarozzi/tradekits
[semantic-release-img]:https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]:https://github.com/semantic-release/semantic-release
[commitizen-img]:https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[commitizen-url]:http://commitizen.github.io/cz-cli/
