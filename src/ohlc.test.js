import 'dotenv/config'
import { ohlc } from './index'
// import { take, toArray } from 'rxjs/operators'
// import { debug } from './helpers'

jest.setTimeout(10000)

describe('ohlc', () => {
  describe('live', () => {
    it('s1$', async done => {
      const { s1$ } = ohlc('BTC-PERPETUAL', 3)
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
})
