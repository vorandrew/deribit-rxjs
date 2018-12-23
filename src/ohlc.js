import ws from './deribit'

import { Observable, concat, merge } from 'rxjs'
import {
  buffer,
  map,
  bufferCount,
  share,
  tap,
  toArray,
  groupBy,
  mergeMap,
  takeWhile,
  skipWhile,
} from 'rxjs/operators'

import { debugNameObj } from './helpers'
import sec$ from './sec'
import periods from './periods'
import history from './history'

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
    t: Math.floor(trades[0].ts / 1000) * 1000,
    o: trades[0].price,
    h: Math.max(...trades.map(one => one.price)),
    l: Math.min(...trades.map(one => one.price)),
    c: trades[trades.length - 1].price,
    v: trades.reduce((sum, trade) => sum + trade.quantity, 0),
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

export default function ohlc(instrument = 'BTC-PERPETUAL', minutes = 15) {
  const history$ = history(instrument, minutes)

  const live$ = Observable.create(async observer => {
    await ws.connected
    ws.hook('trade', instrument, trade =>
      observer.next({
        price: trade.price,
        quantity: trade.quantity,
        ts: trade.timeStamp,
      }),
    )
  })

  let intervals = {
    s1$: concat(
      history$.pipe(
        groupBy(trade => Math.floor(trade.ts / 1000) * 1000),
        mergeMap(group => group.pipe(toArray())),
        map(s1ReduceFn),
      ),
      live$.pipe(
        buffer(sec$),
        map(s1ReduceFn),
      ),
    ).pipe(
      tap(debugNameObj('ohlc-s1', instrument)),
      share(),
    ),
  }

  const ms = new Date().getTime()

  for (let period in periods) {
    const { seconds, prev } = periods[period]
    const secondsPrev = periods[prev] ? periods[prev].seconds : 1

    const prev$ = intervals[prev]

    const currTS = Math.floor(ms / 1000 / seconds) * 1000 * seconds
    const nextTS = Math.ceil(ms / 1000 / seconds) * 1000 * seconds

    const bufferNext = seconds / secondsPrev
    const bufferCurr = Math.ceil(
      (seconds * 1000 - (ms % (seconds * 1000))) / secondsPrev / 1000,
    )

    intervals[period] = merge(
      // historical intervals that happened before current ongoing interval
      prev$.pipe(
        takeWhile(ohlc => ohlc.t < currTS),
        groupBy(ohlc => Math.floor(ohlc.t / 1000 / seconds) * 1000 * seconds),
        mergeMap(group => group.pipe(toArray())),
        map(ohlcs => ohlcsReduceFn(ohlcs, seconds)),
      ),
      // inject current ongoing interval
      prev$.pipe(
        skipWhile(ohlc => ohlc.t < currTS),
        takeWhile(ohlc => ohlc.t < nextTS),
        bufferCount(bufferCurr),
        map(ohlcs => ohlcsReduceFn(ohlcs, seconds)),
      ),
      // inject future regular intervals after current ongoing interval has finished
      prev$.pipe(
        skipWhile(ohlc => ohlc.t < nextTS),
        bufferCount(bufferNext),
        map(ohlcs => ohlcsReduceFn(ohlcs, seconds)),
      ),
    ).pipe(
      tap(debugNameObj(`ohlc-${period}`.slice(0, -1), instrument)),
      share(),
    )
  }

  return {
    ...intervals,
  }
}
