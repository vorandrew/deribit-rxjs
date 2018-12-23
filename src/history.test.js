import 'dotenv/config'
import history from './history'

describe('history', () => {
  it('history', done => {
    const o = history('BTC-PERPETUAL', 10)
    const s = o.subscribe(trade => {
      expect(trade).toHaveProperty('amount')
      expect(trade).toHaveProperty('price')
      expect(trade).toHaveProperty('quantity')
      expect(trade).toHaveProperty('ts')
      expect(trade.ts).toBeLessThan(new Date().getTime())
      s.unsubscribe()
      done()
    })
  })
})
