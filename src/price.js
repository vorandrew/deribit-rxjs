import ws from './deribit'
import { Observable } from 'rxjs'
import { share, tap } from 'rxjs/operators'

import { debugNameObj } from './helpers'

export default function instrument(instrument = 'BTC-PERPETUAL') {
  return Observable.create(async observer => {
    await ws.connected
    ws.hook('order_book', instrument, msg =>
      observer.next({
        bid: msg.bids[0].price,
        mid: (msg.asks[0].price + msg.bids[0].price) / 2,
        ask: msg.asks[0].price,
      }),
    )
  }).pipe(
    share(),
    tap(debugNameObj('price', instrument)),
  )
}
