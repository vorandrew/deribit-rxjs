import 'dotenv/config'
import { trades$ } from './index'
import { msg, authedPromise } from './deribit'

describe('trades$', () => {
  it('trades$', async done => {
    const s = trades$.subscribe(trade => {
      expect(trade).toHaveProperty('instrument_name', 'BTC-PERPETUAL')
      expect(trade).toHaveProperty('amount', 10)
      expect(trade).toHaveProperty('direction', 'sell')
      expect(trade).toHaveProperty('trade_id')
      s.unsubscribe()
      done()
    })

    await authedPromise.then(() =>
      msg({
        method: 'private/sell',
        params: {
          instrument_name: 'BTC-PERPETUAL',
          amount: 10,
          type: 'market',
        },
      }),
    )
  })
})
