import 'dotenv/config'

import WS from 'ws'

import { Subject } from 'rxjs'

import { debugName } from './helpers'

export const read$ = new Subject()
export const write$ = new Subject()

export const ws = new WS('wss://www.deribit.com/ws/api/v2')
const openPromise = new Promise(r => ws.on('open', r))

let n = new Date().getTime() * 1000
let access_token

const promises = {}

setInterval(function() {
  const now = (new Date().getTime - 300) * 1000
  Object.keys(promises).forEach(id => {
    if (id < now) {
      delete promises[id]
    }
  })
}, 300 * 1000)

function noId(msg) {
  // debugName('noId')(msg)

  if (msg.method === 'heartbeat') {
    return ws.send(JSON.stringify({ method: 'public/test' }))
  } else if (msg.method === 'subscription') {
    return read$.next(msg)
  } else if (msg.result && msg.result.version) {
    return
  } else {
    return debugName('error')(msg)
  }
}

ws.on('message', msg => {
  const msgJSON = JSON.parse(msg)

  if (!msgJSON.id) {
    return noId(msgJSON)
  }

  const { resolve, reject } = promises[msgJSON.id]
  delete promises[msgJSON.id]

  msgJSON.error ? reject(msgJSON.error) : resolve(msgJSON.result)

  if (msgJSON.error) {
    const { code, message, data } = msgJSON.error

    const err = new Error(message)
    err.code = code
    err.data = data

    reject(err)
    read$.next(err)
  } else {
    resolve(msgJSON.result)
    read$.next(msgJSON.result)
  }
})

export function msg(msg) {
  return openPromise.then(() => {
    return new Promise((resolve, reject) => {
      const id = ++n

      promises[id] = { resolve, reject }

      if (msg.method.startsWith('private')) {
        msg.params.access_token = access_token
      }

      const msgJSON = JSON.stringify({
        jsonrpc: '2.0',
        id,
        method: msg.method,
        params: msg.params || {},
      })

      ws.send(msgJSON)
      write$.next(msgJSON)
    })
  })
}

msg({
  method: 'public/hello',
  params: {
    client_name: 'deribit-rxjs',
    client_version: '0.1.0',
  },
})

export const authedPromise =
  process.env.DERIBIT_KEY && process.env.DERIBIT_SECRET
    ? msg({
      method: 'public/auth',
      params: {
        grant_type: 'client_credentials',
        client_id: process.env.DERIBIT_KEY,
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
        }),
      )
      .catch(err => debugName('error')(err))
    : Promise.reject(new Error('No key/secret provided'))

msg({
  method: 'public/set_heartbeat',
  params: { interval: 30 },
})

read$.subscribe(debugName('read'))
