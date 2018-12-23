import ws from './deribit'
import _ from 'lodash/fp'
import { Observable } from 'rxjs'

export default function history(instrument = 'BTC-PERPETUAL', minutes = 60) {
  return Observable.create(observer => {
    ws.connected.then(() => {
      ws.action('getlasttrades', {
        instrument,
        count: 1000,
        startTimestamp: new Date().getTime() - 1000 * 60 * minutes,
      })
        .then(trades => {
          return trades.map(one => ({
            amount: one.amount,
            price: one.price,
            quantity: one.quantity,
            ts: one.timeStamp,
          }))
        })
        .then(_.sortBy('ts'))
        .then(trades => trades.map(trade => observer.next(trade)))
        .then(() => observer.complete())
        .catch(err => observer.error(err))
    })
  })
}
