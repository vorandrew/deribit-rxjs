import ws from './deribit'
import { Observable } from 'rxjs'
import { share, tap } from 'rxjs/operators'

import { debugNameObj } from './helpers'

export default function index(symbol = 'BTC') {
  return Observable.create(async observer => {
    await ws.connected
    ws.hook('order_book', 'index', msg => observer.next(msg[symbol.toLowerCase()]))
  }).pipe(
    tap(debugNameObj('index', 'XBT')),
    share(),
  )
}
