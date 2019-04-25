import { msg, read$ } from './deribit'
import { share, tap, filter, map, distinctUntilChanged } from 'rxjs/operators'

import { debugName } from './helpers'

export default function index(curr = 'btc') {
  curr = curr.toLowerCase()

  msg({
    method: 'public/subscribe',
    params: { channels: [`deribit_price_index.${curr}_usd`] },
  })

  return read$.pipe(
    filter(
      m =>
        m.method === 'subscription' &&
        m.params.channel === `deribit_price_index.${curr}_usd`,
    ),
    map(o => o.params.data.price),
    distinctUntilChanged(),
    tap(debugName('index')),
    share(),
  )
}
