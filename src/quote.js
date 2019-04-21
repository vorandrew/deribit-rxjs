import { msg, read$ } from './deribit'
import { share, tap, filter, map } from 'rxjs/operators'

import { debugName } from './helpers'

export default function quote(instrument) {
  msg({
    method: 'public/subscribe',
    params: { channels: [`quote.${instrument}`] },
  })

  return read$.pipe(
    filter(
      m => m.method === 'subscription' && m.params.channel === `quote.${instrument}`,
    ),
    map(o => ({
      instrument_name: o.params.data.instrument_name,
      bid: o.params.data.best_bid_price,
      ask: o.params.data.best_ask_price,
      bid_amount: o.params.data.best_bid_amount,
      ask_amount: o.params.data.best_ask_amount,
    })),
    tap(debugName('quote')),
    share(),
  )
}
