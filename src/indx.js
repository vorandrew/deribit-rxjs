import ws from './deribit'
import { Observable } from 'rxjs'
import { share, tap } from 'rxjs/operators'

import { debugNameObj } from './helpers'

export default function index() {
  return Observable.create(async observer => {
    await ws.connected
    ws.hook('order_book', 'index', msg => observer.next(msg.btc))
  }).pipe(
    tap(debugNameObj('index', 'XBT')),
    share(),
  )
}
