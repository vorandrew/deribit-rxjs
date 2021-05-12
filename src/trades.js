import { deribit$ } from './deribit'
import { from } from 'rxjs'
import { share, tap, filter, mergeMap } from 'rxjs/operators'

import { debugName } from './helpers'

export default deribit$.pipe(
  filter(
    m => m.method === 'subscription' && m.params.channel === 'user.trades.any.any.raw'
  ),
  mergeMap(o => from(o.params.data)),
  tap(debugName('trades')),
  share()
)
