import ws from './deribit'
import { from, concat } from 'rxjs'
import { share, tap, switchMapTo } from 'rxjs/operators'
import { trades$ } from './'

import { debugName } from './helpers'

export default concat(
  from(ws.connected.then(() => ws.action('positions'))),
  trades$.pipe(switchMapTo(from(ws.action('positions')))),
).pipe(
  share(),
  tap(debugName('positions')),
)
