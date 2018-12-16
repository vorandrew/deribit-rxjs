import 'dotenv/config'
import { trades$ } from './index'
import ws from './deribit'

describe('trades$', () => {
  it('trades$', async done => {
    const s = trades$.subscribe(trade => {
      expect(trade).toHaveProperty('instrument', 'BTC-PERPETUAL')
      expect(trade).toHaveProperty('quantity', 1)
      expect(trade).toHaveProperty('direction', 'buy')
      expect(trade).toHaveProperty('tradeId')
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
