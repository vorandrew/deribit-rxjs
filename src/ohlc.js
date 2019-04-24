import { msg, read$ } from './deribit'

import { from } from 'rxjs'
import {
  map,
  share,
  tap,
  filter,
  mergeMap,
  buffer,
  skip,
  distinctUntilChanged,
} from 'rxjs/operators'

import { debugName } from './helpers'
import sec$ from './sec'
import periods from './periods'
// import history from './history'

const boundary = seconds => ts => Math.floor(ts / seconds / 1000) * 1000 * seconds

const s1ReduceFn = trades => {
  if (trades.length === 0) {
    return {
      t: Math.floor(new Date().getTime() / 1000) * 1000,
      o: null,
      h: null,
      l: null,
      c: null,
      v: null,
    }
  }

  return {
    t: Math.floor(trades[0].timestamp / 1000) * 1000,
    o: trades[0].price,
    h: Math.max(...trades.map(one => one.price)),
    l: Math.min(...trades.map(one => one.price)),
    c: trades[trades.length - 1].price,
    v: trades.reduce((sum, trade) => sum + trade.amount, 0),
  }
}

const ohlcsReduceFn = (ohlcs, seconds) => {
  if (ohlcs.length === 0) {
    return {
      t: Math.floor(new Date().getTime() / 1000 / seconds) * 1000 * seconds,
      o: null,
      h: null,
      l: null,
      c: null,
      v: null,
    }
  }

  const notEmpty = ohlcs.filter(bar => bar.v > 0)

  if (notEmpty.length === 0) return ohlcs[0]

  return {
    t: ohlcs[0].t,
    o: notEmpty[0].o,
    h: Math.max(...notEmpty.map(bar => bar.h)),
    l: Math.min(...notEmpty.map(bar => bar.l)),
    c: notEmpty[0].c,
    v: notEmpty.reduce((sum, bar) => sum + bar.v, 0),
  }
}

export default function ohlc(instrument = 'BTC-PERPETUAL') {
  msg({
    method: 'public/subscribe',
    params: { channels: [`trades.${instrument}.100ms`] },
  })

  // const history$ = history(instrument, minutes).pipe(
  //   groupBy(trade => Math.floor(trade.timestamp / 1000) * 1000),
  //   mergeMap(group$ => group$.pipe(toArray())),
  //   map(s1ReduceFn),
  // )

  const s1$ = read$.pipe(
    filter(
      m =>
        m.method === 'subscription' && m.params.channel === `trades.${instrument}.100ms`,
    ),
    mergeMap(o => from(o.params.data)),
    map(o => ({
      timestamp: o.timestamp,
      price: o.price,
      amount: o.amount,
    })),
    buffer(sec$),
    map(s1ReduceFn),
    share(),
  )

  const p$ = { s1$ }

  Object.entries(periods).forEach(([p, e]) => {
    p$[p] = s1$.pipe(
      buffer(
        sec$.pipe(
          map(boundary(e.seconds)),
          distinctUntilChanged(),
        ),
      ),
      map(ohlcsReduceFn),
      skip(1),
      tap(debugName(`ohlc_${p}`)),
    )
  })

  return p$
}
