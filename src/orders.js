import deribit, { read$ } from './deribit'
import { merge, Subject } from 'rxjs'
import { share, tap, filter, map, scan } from 'rxjs/operators'

import { debugName } from './helpers'

import Promise from 'bluebird'

import { currencies } from './utils'

const onConnectOrders$ = new Subject()

deribit.onAuth(() => {
  currencies
    .then(currs =>
      Promise.map(currs, currency =>
        deribit.msg({
          method: 'private/get_open_orders_by_currency',
          params: { currency },
        }),
      ),
    )
    .then(orders => onConnectOrders$.next(orders.flat()))
})

export default merge(
  onConnectOrders$,
  read$.pipe(
    filter(
      m => m.method === 'subscription' && m.params.channel === 'user.orders.any.any.raw',
    ),
    map(o => [o.params.data]),
  ),
).pipe(
  scan((orders, order) => {
    return [...orders.filter(o => o.order_id != order[0].order_id), ...order]
  }, []),
  map(orders =>
    orders.filter(
      o =>
        !['filled', 'rejected', 'cancelled', 'triggered'].includes(o.order_state) ||
        o.last_update_timestamp >= new Date().getTime() - 5000,
    ),
  ),
  tap(debugName('orders')),
  share(),
)
