import ws from './deribit'

import { timer, Observable, concat } from 'rxjs'
import { buffer, map, filter, take, bufferCount, share, tap } from 'rxjs/operators'

import { debugNameObj } from './helpers'

let last = Math.ceil(new Date().getTime() / 1000) * 1000

const second$ = timer(new Date(last), 333).pipe(
  filter(() => {
    const tsms = Math.floor(new Date().getTime() / 1000) * 1000
    if (tsms > last) {
      last = tsms
      return true
    }
    return false
  }),
  share(),
)

export default function ohlc(instrument = 'BTC-PERPETUAL') {
  const trades$ = Observable.create(async observer => {
    await ws.connected
    ws.hook('trade', instrument, trade => observer.next(trade))
  })

  const s1$ = trades$.pipe(
    buffer(second$),
    map(trades => {
      const t = Math.floor(new Date().getTime() / 1000) * 1000

      if (trades.length === 0) {
        return {
          t,
          o: null,
          h: null,
          l: null,
          c: null,
          v: null,
        }
      }

      return {
        t,
        o: trades[0].price,
        h: Math.max(...trades.map(one => one.price)),
        l: Math.min(...trades.map(one => one.price)),
        c: trades[trades.length - 1].price,
        v: trades.reduce((sum, trade) => sum + trade.quantity, 0),
      }
    }),
    share(),
    tap(debugNameObj('ohlc-s1', instrument)),
  )

  const ms = new Date().getTime()

  const periods = {
    s5$: { prev: 's1$', seconds: 5 },
    s15$: { prev: 's5$', seconds: 15 },
    s30$: { prev: 's15$', seconds: 30 },
    m1$: { prev: 's30$', seconds: 60 * 1 },
    m5$: { prev: 'm1$', seconds: 60 * 5 },
    m15$: { prev: 'm5$', seconds: 60 * 15 },
    m30$: { prev: 'm15$', seconds: 60 * 30 },
    h1$: { prev: 'm30$', seconds: 60 * 60 * 1 },
    h4$: { prev: 'h1$', seconds: 60 * 60 * 4 },
    d1$: { prev: 'h4$', seconds: 60 * 60 * 24 },
  }

  let intervals = {
    s1$,
  }

  let mapFn = ohlcs => {
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

  for (let period in periods) {
    const { seconds, prev } = periods[period]
    const secondsPrev = periods[prev] ? periods[prev].seconds : 1

    const prevTime = Math.floor(ms / 1000 / seconds) * 1000 * seconds
    const elapsed = ms - prevTime
    const bufferN = seconds / secondsPrev
    let oneTime = Math.ceil(bufferN - elapsed / secondsPrev / 1000)

    if (period === 's5$') {
      oneTime -= 1
    }

    intervals[period] = concat(
      intervals[prev].pipe(
        take(oneTime),
        bufferCount(oneTime),
        map(mapFn),
      ),
      intervals[prev].pipe(
        bufferCount(bufferN),
        map(mapFn),
      ),
    ).pipe(
      share(),
      tap(debugNameObj(`ohlc-${period}`.slice(0, -1), instrument)),
    )
  }

  return {
    ...intervals,
  }
}
