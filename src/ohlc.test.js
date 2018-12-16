import 'dotenv/config'
import { ohlc } from './index'

describe('ohlc', () => {
  it('s1$', async done => {
    const { s1$ } = ohlc()
    const s = s1$.subscribe(ohlc => {
      expect(ohlc).toHaveProperty('t')
      expect(ohlc).toHaveProperty('o')
      expect(ohlc).toHaveProperty('h')
      expect(ohlc).toHaveProperty('l')
      expect(ohlc).toHaveProperty('c')
      expect(ohlc).toHaveProperty('v')
      s.unsubscribe()
      done()
    })
  })
})
