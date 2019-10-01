import deribit, { read$ } from './deribit'
import { from, merge, Subject } from 'rxjs'
import {
  share,
  tap,
  filter,
  map,
  switchMap,
  scan,
  distinctUntilChanged,
} from 'rxjs/operators'

import Promise from 'bluebird'

import flatten from 'lodash/flatten'
import isEqual from 'lodash/isEqual'

import { debugName } from './helpers'

import { currencies } from './utils'

const onConnectPositions$ = new Subject()

deribit.onAuth(() => {
  currencies
    .then(currs =>
      Promise.map(currs, currency =>
        deribit.msg({
          method: 'private/get_positions',
          params: { currency },
        }),
      ),
    )
    .then(orders => onConnectPositions$.next(orders.flat()))
})

export default merge(
  onConnectPositions$,
  read$.pipe(
    filter(
      m => m.method === 'subscription' && m.params.channel === 'user.trades.any.any.raw',
    ),
    switchMap(m => {
      const currency = m.params.data[0].instrument_name.substring(0, 3)
      return from(
        deribit.authedPromise.then(() =>
          deribit.msg({ method: 'private/get_positions', params: { currency } }),
        ),
      )
    }),
  ),
).pipe(
  scan((acc, positions) => {
    if (positions.length === 0) {
      return acc
    }

    const curr = positions[0].instrument_name.substring(0, 3)
    acc[curr] = positions
    return acc
  }, {}),
  map(p => {
    return flatten(
      Object.values(p).map(all =>
        all
          .filter(p => p.size !== 0)
          .map(p => {
            const { kind, instrument_name, size, average_price_usd, average_price } = p
            return {
              kind,
              currency: instrument_name.substring(0, 3),
              instrument_name,
              size,
              average_price_usd,
              average_price,
            }
          }),
      ),
    )
  }),
  distinctUntilChanged(isEqual),
  tap(debugName('positions')),
  share(),
)
