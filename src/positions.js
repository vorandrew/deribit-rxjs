import { msg, deribit$, authenticate } from './deribit'
import { from, merge } from 'rxjs'
import {
  share,
  tap,
  filter,
  map,
  exhaustMap,
  scan,
  distinctUntilChanged,
} from 'rxjs/operators'

import flatten from 'lodash/flatten'
import isEqual from 'lodash/isEqual'

import { debugName } from './helpers'

export default merge(
  from(
    authenticate().then(() =>
      msg({ method: 'private/get_positions', params: { currency: 'BTC' } })
    )
  ),
  from(
    authenticate().then(() =>
      msg({ method: 'private/get_positions', params: { currency: 'ETH' } })
    )
  ),
  deribit$.pipe(
    filter(
      m => m.method === 'subscription' && m.params.channel === 'user.trades.any.any.raw'
    ),
    exhaustMap(m => {
      const symbol = m.params.data[0].instrument_name.substring(0, 3)
      return from(
        authenticate().then(() =>
          msg({ method: 'private/get_positions', params: { currency: symbol } })
        )
      )
    })
  )
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
              average_price_usd: average_price_usd ? average_price_usd : average_price,
              average_price,
            }
          })
      )
    )
  }),
  distinctUntilChanged(isEqual),
  tap(debugName('positions')),
  share()
)
