import { msg, read$ } from './deribit'
import { share, tap, filter, map } from 'rxjs/operators'

import { debugName } from './helpers'

const special = ['all', 'future', 'option']

function getChannels(instrument, currency) {
  const payload = {
    method: 'public/get_instruments',
    params: { currency, expired: false },
  }

  if (['option', 'future'].includes(instrument)) {
    payload.params.kind = instrument
  }

  return msg(payload).then(all => all.map(o => `quote.${o.instrument_name}`))
}

export default function quote(instrument, curr = 'BTC') {
  let channels = []

  if (special.includes(instrument)) {
    getChannels(instrument, curr).then(chs => {
      channels = chs
      msg({ method: 'public/subscribe', params: { channels } })
    })

    setInterval(function() {
      getChannels(instrument, curr).then(chs => {
        channels = chs
        msg({ method: 'public/subscribe', params: { channels } })
      })
    }, 1000 * 60 * 15)
  } else {
    channels = [`quote.${instrument}`]
    msg({ method: 'public/subscribe', params: { channels } })
  }

  return read$.pipe(
    filter(m => m.method === 'subscription' && channels.includes(m.params.channel)),
    map(o => ({
      instrument_name: o.params.data.instrument_name,
      bid: o.params.data.best_bid_price,
      ask: o.params.data.best_ask_price,
      bid_amount: o.params.data.best_bid_amount,
      ask_amount: o.params.data.best_ask_amount,
    })),
    tap(debugName('quote')),
    share(),
  )
}
