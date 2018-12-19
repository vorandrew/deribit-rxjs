import ws from './deribit'
import { Observable } from 'rxjs'
import { share, tap } from 'rxjs/operators'

import { debugName } from './helpers'

export default Observable.create(async observer => {
  await ws.connected
  ws.hook('user_order', order => observer.next(order))
}).pipe(
  tap(debugName('order')),
  share(),
)
