import 'dotenv/config'
import { ohlc } from './index'
// import { take, toArray } from 'rxjs/operators'
// import { debug } from './helpers'

describe('ohlc', () => {
  describe('live', () => {
    it('s1$', async done => {
      const { s1$ } = ohlc('BTC-PERPETUAL', 0)
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

  describe('history', () => {
    it('s1$', done => {
      const { s1$ } = ohlc('BTC-PERPETUAL', 5)
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

    // it('s1$dev', done => {
    //   const { s1$, s5$ } = ohlc('BTC-PERPETUAL', 5)
    //   const s = s5$.subscribe(ohlc => 1)

    //   setTimeout(() => {
    //     s.unsubscribe()
    //     done(0)
    //   }, 2000)
    // })
  })
})
