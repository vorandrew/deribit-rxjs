import 'dotenv/config'
import { orders$ } from './index'
import { msg, authenticate } from './deribit'

jest.setTimeout(10000)

describe('orders', () => {
  it('orders', async done => {
    const s = orders$.subscribe(orders => {
      expect(orders.length).toBeGreaterThan(0)
      const one = orders.filter(one => one.instrument_name === 'BTC-PERPETUAL')[0]
      expect(one).toHaveProperty('amount', 10)
      expect(one).toHaveProperty('filled_amount')
      expect(one).toHaveProperty('direction')
      expect(one).toHaveProperty('average_price')
      expect(one).toHaveProperty('order_state')
      expect(one).toHaveProperty('order_type')
      expect(one).toHaveProperty('post_only')
      s.unsubscribe()
      done()
    })

    await authenticate().then(() =>
      msg({
        method: 'private/buy',
        params: {
          instrument_name: 'BTC-PERPETUAL',
          amount: 10,
          price: 2000,
          type: 'limit',
        },
      })
    )
  })
})
