import 'dotenv/config'
import { orders$ } from './index'
import ws from './deribit'

describe('orders$', () => {
  it('orders$', async done => {
    const s = orders$.subscribe(trade => {
      expect(trade).toHaveProperty('filledQuantity', 1)
      expect(trade).toHaveProperty('state', 'filled')
      expect(trade).toHaveProperty('avgPrice')
      s.unsubscribe()
      done()
    })

    await ws.connected

    await ws.action('buy', {
      instrument: 'BTC-PERPETUAL',
      quantity: 1,
      type: 'market',
      label: '1123123',
    })
  })
})
