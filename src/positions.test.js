import 'dotenv/config'
import { positions$ } from './index'
import ws from './deribit'

describe('positions', () => {
  it('positions', async done => {
    const s = positions$.subscribe(positions => {
      expect(positions.length).toBeGreaterThan(0)
      const one = positions.filter(one => one.instrument === 'BTC-PERPETUAL')[0]
      expect(one).toHaveProperty('kind', 'future')
      expect(one).toHaveProperty('amount')
      expect(one).toHaveProperty('direction')
      expect(one).toHaveProperty('size')
      expect(one).toHaveProperty('profitLoss')
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
