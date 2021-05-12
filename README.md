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
import { quote, index, positions$, orders$, trades$, sec$, read$, deribit } from 'deribit-rxjs'
```

# Deribit Websocket

See https://www.deribit.com/apiconsole/v2

Websocket messages observable

```
deribit$.subscribe(console.log)
```

Authenticate

```
deribit.authenticate()
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

Order management

```js
import { order, edit, cancel, stop } from 'deribit-rxjs'

order(opts).subscribe(console.log)
edit(opts).subscribe(console.log)
cancel(order_id).subscribe(console.log)
stop(opts).subscribe(console.log)
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
