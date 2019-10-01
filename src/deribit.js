import 'dotenv/config'

import EventEmitter from 'events'

import ReconnectingWebSocket from 'reconnecting-websocket'
import WS from 'ws'

import { Subject } from 'rxjs'

export const read$ = new Subject()
export const write$ = new Subject()

let access_token

class DeribitRxJs extends EventEmitter {
  constructor() {
    super()

    this.ws = new ReconnectingWebSocket('wss://www.deribit.com/ws/api/v2', [], {
      WebSocket: WS,
    })

    this.promises = {}

    this.id = new Date().getTime() + 1000

    this.interval = 10

    this.lastResp = new Date().getTime()

    this.connectedPromise = new Promise(resolve => this.on('connect', resolve))
    this.authedPromise = new Promise(resolve => this.on('auth', resolve))

    this.connected = false
    this.authed = false

    this.ws.addEventListener('open', () =>
      setTimeout(() => {
        this.connected = true
        this.emit('connect')
      }, 100),
    )

    this.ws.onerror = err => {
      throw err
    }

    this.ws.addEventListener('message', this._read)

    this.onConnect(() => {
      this.msg({
        method: 'public/hello',
        params: {
          client_name: 'deribit-rxjs',
          client_version: '3.0.0',
        },
      })

      this.msg({
        method: 'public/set_heartbeat',
        params: { interval: this.interval },
      })

      if (process.env.DERIBIT_KEY && process.env.DERIBIT_SECRET) {
        this.msg({
          method: 'public/auth',
          params: {
            grant_type: 'client_credentials',
            client_id: process.env.DERIBIT_KEY,
            client_secret: process.env.DERIBIT_SECRET,
          },
        }).then(msg => {
          access_token = msg.access_token
          this.authed = true
          this.emit('auth')
        })
      }
    })

    this.on('auth', () => {
      this.msg({
        method: 'private/subscribe',
        params: {
          channels: ['user.trades.any.any.raw', 'user.orders.any.any.raw'],
        },
      })
    })

    this._cleanupInterval = setInterval(() => {
      const now = (new Date().getTime - 300) * 1000
      Object.keys(this.promises).forEach(id => {
        if (id < now) {
          delete this.promises[id]
        }
      })
    }, 100 * 1000)

    this._reconnectInterval = setInterval(() => {
      if (new Date().getTime() - this.lastResp > 1000 * this.interval) {
        this.lastResp = new Date().getTime() + 1000 * this.interval
        this.reconnect()
      }
    }, this.interval * 1000)
  }

  reconnect() {
    this.ws.reconnect()
  }

  disconnect() {
    this.ws.close()
    clearInterval(this._cleanupInterval)
    clearInterval(this._reconnectInterval)
  }

  _noId = msg => {
    if (msg.method === 'heartbeat') {
      return this.ws.send(JSON.stringify({ method: 'public/test' }))
    } else if (msg.method === 'subscription') {
      return read$.next(msg)
    } else if (msg.result && msg.result.version) {
      return
    } else {
      const err = new Error('Unknown message format')
      err.msg = msg
      throw err
    }
  }

  _read = e => {
    this.lastResp = new Date().getTime()

    const msg = e.data
    const msgJSON = JSON.parse(msg)

    if (!msgJSON.id) {
      return this._noId(msgJSON)
    }

    // TODO check WeakMap
    const { resolve, reject } = this.promises[msgJSON.id]
    delete this.promises[msgJSON.id]

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
  }

  msg = msg => {
    return new Promise((resolve, reject) => {
      if (!this.connected) {
        return reject('Not connected')
      }

      const { method, params = {} } = msg

      const id = ++this.id

      if (method.startsWith('private')) {
        params.access_token = access_token

        if (!this.authed) {
          return reject('Not authenticated')
        }
      }

      this.promises[id] = { resolve, reject }

      const msgJSON = JSON.stringify({
        jsonrpc: '2.0',
        id,
        method,
        params,
      })

      this.ws.send(msgJSON)
      write$.next(msgJSON)
    })
  }

  onConnect(fn) {
    this.on('connect', fn)
  }

  onAuth(fn) {
    this.on('auth', fn)
  }
}

export default new DeribitRxJs()
