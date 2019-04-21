import { msg, read$, authedPromise } from './deribit'
import { from, merge } from 'rxjs'
import { share, tap, filter, map, scan } from 'rxjs/operators'

import { debugName } from './helpers'

export default merge(
  from(
    authedPromise.then(() =>
      Promise.all([
        msg({
          method: 'private/get_open_orders_by_currency',
          params: { currency: 'BTC' },
        }),
        msg({
          method: 'private/get_open_orders_by_currency',
          params: { currency: 'ETH' },
        }),
      ]).then(([btc, eth]) => [...btc, ...eth]),
    ),
  ),
  read$.pipe(
    filter(
      m => m.method === 'subscription' && m.params.channel === 'user.orders.any.any.raw',
    ),
    map(o => [o.params.data]),
  ),
).pipe(
  scan((orders, order) => {
    return [...orders.filter(o => o.order_id !== order[0].id), ...order]
  }, []),
  map(orders =>
    orders.filter(
      o =>
        !['filled', 'rejected', 'cancelled'].includes(o.order_state) ||
        o.last_update_timestamp >= new Date().getTime() * 1000 * 10,
    ),
  ),
  tap(debugName('orders')),
  share(),
)
