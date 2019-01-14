# deribit-rxjs

Deribit.com RxJS bindings

# Install

```bash
yarn add deribit-rxjs
```

# Setup

ENV vars

```bash
DERIBIT_KEY=key_here        // API Key
DERIBIT_SECRET=secret_here  // API Secret
```

Import

```js
import { ohlc, price, index, orders$, positions$, trades$, deribit } from 'deribit-rxjs'
```

Deribit Websocket

```
deribit.connected
  .then(() => deribit.action('ping'))
  .then(pong => console.log(pong))
```

Index

```js
const index('BTC').subscribe(console.log) // 3500
```

Price

```js
const price('BTC-PERPETUAL').subscribe(console.log) // One instrument
const price('futures').subscribe(console.log) //  ['all', 'futures', 'options', 'index', 'any_instrument_name']
```

OHLC

```js
const minutes_of_history_prices = 10
const { s1$, s5$, s15$, m1$, m15$, m30$, h1$, h4$, d1$ } = ohlc(
  'BTC-PERPETUAL',
  minutes_of_history_prices,
)
s5$.subscribe(console.log) // { t: 1545007679000, o: 333, h: 555, l: 222, c: 4444, v: 12355 }
```

Trades

```js
trades$.subscribe(console.log) // See deribit API
```

Positions

```js
positions$.subscribe(console.log) // See deribit API
```

Orders

```js
orders$.subscribe(console.log) // See deribit API
```
