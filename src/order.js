import { msg, authenticate } from './deribit'

import { from, of } from 'rxjs'
import { tap } from 'rxjs/operators'

import { debugName } from './helpers'

export function order(opts) {
  const buySell = opts.amount > 0 ? 'buy' : 'sell'

  const ordr = {
    type: 'market',
    label: 'label',
    ...opts,
    amount: Math.abs(opts.amount),
  }

  if (ordr.price && ordr.type === 'market') {
    ordr.type = 'limit'
    ordr.post_only = true
  }

  if (process.env.DERIBIT_SAFE) {
    return of({ buySell, ...ordr }).pipe(tap(debugName(`order-${ordr.label}-safe`)))
  }

  return from(
    authenticate()
      .then(() =>
        msg({
          method: `private/${buySell}`,
          params: { ...ordr },
        })
      )
      .catch(err => {
        err.data ? (err.data.order = ordr) : (err.order = ordr)
        throw err
      })
  ).pipe(tap(debugName(`order-${ordr.label}`)))
}

export function edit(opts) {
  const ordr = {
    post_only: true,
    ...opts,
    amount: Math.abs(opts.amount),
  }

  if (process.env.DERIBIT_SAFE) {
    return of(ordr).pipe(tap(debugName('order-edit-safe')))
  }

  return from(
    authenticate()
      .then(() =>
        msg({
          method: 'private/edit',
          params: { ...ordr },
        })
      )
      .catch(err => {
        err.data ? (err.data.order = ordr) : (err.order = ordr)
        throw err
      })
  ).pipe(tap(debugName('order-edit')))
}

export function cancel(order_id) {
  if (process.env.DERIBIT_SAFE) {
    return of({ order_id }).pipe(tap(debugName('order-cancel-safe')))
  }

  return from(
    authenticate().then(() =>
      msg({ method: 'private/cancel', params: { order_id } }).catch(err => {
        err.data ? (err.data.order_id = order_id) : (err.order_id = order_id)
        throw err
      })
    )
  ).pipe(tap(debugName('order-cancel')))
}

export function stop(opts) {
  return order({
    amount: opts.amount,
    instrument_name: opts.instrument_name,
    stop_price: opts.price,
    type: 'stop_market',
    trigger: 'mark_price',
  })
}
