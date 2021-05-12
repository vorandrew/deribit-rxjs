import { of } from 'rxjs'
import { find, mergeMap, filter } from 'rxjs/operators'
import ws from './ws'

let n = 1
let access_token
let authenticated

export const deribit$ = ws()

const subscribtion = deribit$.subscribe()

export function close() {
  subscribtion.unsubscribe()
}

export function msg(obj, timeout = 3000) {
  const id = n++

  return new Promise((resolve, reject) => {
    const timer = setTimeout(function () {
      reject('Timeout')
    }, timeout)

    deribit$.pipe(find(val => val.id === id)).subscribe({
      next: val => {
        clearTimeout(timer)
        resolve(val.result)
      },
      error: reject,
    })

    if (obj.method.startsWith('private')) {
      obj.params.access_token = access_token
    }

    deribit$.next({
      ...obj,
      jsonrpc: '2.0',
      id,
    })
  })
}

export async function authenticate() {
  if (authenticated) {
    return authenticated
  }

  if (!process.env.DERIBIT_ID || !process.env.DERIBIT_SECRET) {
    return Promise.reject(new Error('No key/secret provided'))
  }

  authenticated = msg({
    method: 'public/auth',
    params: {
      grant_type: 'client_credentials',
      client_id: process.env.DERIBIT_ID,
      client_secret: process.env.DERIBIT_SECRET,
    },
  })
    .then(msg => (access_token = msg.access_token))
    .then(() =>
      msg({
        method: 'private/subscribe',
        params: {
          channels: [
            'user.trades.any.any.raw',
            'user.orders.any.any.raw',
            'user.portfolio.BTC',
            'user.portfolio.ETH',
          ],
        },
      })
    )

  return authenticated
}

export function enable_cancel_on_disconnect(scope = 'account') {
  return msg({
    method: 'private/enable_cancel_on_disconnect',
    params: { scope },
  })
}

export function heartbeat(interval = 30) {
  return msg({
    method: 'public/set_heartbeat',
    params: { interval },
  })
}

export function hello(client_version = '2.0.5') {
  return msg({
    method: 'public/hello',
    params: {
      client_name: 'deribit-rxjs',
      client_version,
    },
  })
}

subscribtion.add(
  deribit$
    .pipe(
      filter(msg => msg.method === 'heartbeat'),
      mergeMap(() => of(msg({ method: 'public/test' })))
    )
    .subscribe()
)
