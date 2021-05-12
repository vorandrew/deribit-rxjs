import { debugName } from './helpers'

import { webSocket } from 'rxjs/webSocket'
import WebSocket from 'ws'

const debug = debugName('ws')

export default function ws$(opts = { url: 'wss://www.deribit.com/ws/api/v2' }) {
  return webSocket({
    WebSocketCtor: function () {
      const ws = new WebSocket(opts.url)

      ws.on('open', () => debug('WS opened'))
      ws.on('message', data => debug(JSON.parse(data)))
      ws.on('close', () => debug('WS closed'))

      return ws
    },
  })
}
