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

# Import

```js
import { ohlc, quote, index, positions$, orders$, trades$, sec$, read$, deribit } from 'deribit-rxjs'
```

# Deribit Websocket

See https://test.deribit.com/apiconsole/v2

Websocket messages observable

```
read$.subscribe(console.log)
```

Connected

```
deribit.connected
  .then(() => deribit.msg({'method': 'public/get_time'}))
  .then(timestamp => console.log(timestamp))
```

Authenticated

```
deribit.authenticated
  .then(() =>
    deribit.msg({
      method: 'private/get_positions',
      params: { currency: 'BTC' },
    }),
  )
  .then(positions => console.log(positions))
```

Send message

```
deribit
  .msg({'method': 'public/get_time'})
  .then(timestamp => console.log(timestamp))
```


Seconds (no drift)

```js
sec$.subscribe(console.log) // 1545007679000
```

Index

```js
index('btc').subscribe(console.log) // 3500
```

Quote

```js
quote('BTC-PERPETUAL').subscribe(console.log) // One instrument
quote('future', 'ETH').subscribe(console.log) // By kind - ['all', 'future', 'option']
```

OHLC

```js
const { s1$, s5$, s15$, m1$, m15$, m30$, h1$, h4$, d1$ } = ohlc('BTC-PERPETUAL')
s5$.subscribe(console.log) // { t: 1545007679000, o: 333, h: 555, l: 222, c: 4444, v: 12355 }
```

Trades

```js
trades$.subscribe(console.log)
```

Positions

```js
positions$.subscribe(console.log)
```

Orders

```js
orders$.subscribe(console.log)
```
