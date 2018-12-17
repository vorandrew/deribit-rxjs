import ws from './deribit'
import { Observable } from 'rxjs'
import { share, tap } from 'rxjs/operators'

import { debugNameObj } from './helpers'

export default function price(instrument = 'BTC-PERPETUAL') {
  return Observable.create(async observer => {
    await ws.connected
    ws.hook('order_book', instrument, msg =>
      observer.next({
        instrument: msg.instrument,
        bid: msg.bids.length > 0 ? msg.bids[0].price : null,
        mid:
          msg.bids.length > 0 && msg.asks.length > 0
            ? (msg.asks[0].price + msg.bids[0].price) / 2
            : null,
        ask: msg.asks.length > 0 ? msg.asks[0].price : null,
      }),
    )
  }).pipe(
    share(),
    tap(debugNameObj('price', instrument)),
  )
}
