import ws from './deribit'
import { from, concat } from 'rxjs'
import { share, tap, switchMap } from 'rxjs/operators'
import { trades$ } from './'

import { debugName } from './helpers'

export default concat(
  from(ws.connected.then(() => ws.action('positions'))),
  trades$.pipe(switchMap(() => ws.action('positions'))),
).pipe(
  tap(debugName('positions')),
  share(),
)
