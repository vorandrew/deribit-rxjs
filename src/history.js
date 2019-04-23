import { msg, openPromise } from './deribit'
import { Subject } from 'rxjs'

import _ from 'lodash/fp'

export default function history(instrument_name = 'BTC-PERPETUAL', minutes = 5) {
  const obs = new Subject()

  openPromise
    .then(async () => {
      let start_timestamp = new Date().getTime() - 60 * minutes * 1000

      do {
        const data = await msg({
          method: 'public/get_last_trades_by_instrument_and_time',
          params: {
            instrument_name,
            start_timestamp,
            count: 300,
          },
        })

        start_timestamp = data.has_more
          ? data.trades[data.trades.length - 1].timestamp + 1
          : null

        _.flow(
          _.map(one => ({
            amount: one.amount,
            price: one.price,
            ts: one.timestamp,
          })),
          _.sortBy('ts'),
          _.map(o => obs.next(o)),
        )(data.trades)
      } while (start_timestamp)

      obs.complete()
    })
    .catch(e => {
      const err = new Error(e.message)
      err.code = e.code
      err.data = { ...e.data, instrument_name }

      obs.error(err)
    })

  return obs
}
