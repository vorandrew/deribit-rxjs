import 'dotenv/config'
import { price } from './index'

describe('price', () => {
  it('price', done => {
    const btc$ = price()
    const s = btc$.subscribe(price => {
      expect(price).toHaveProperty('bid')
      expect(price).toHaveProperty('mid')
      expect(price).toHaveProperty('ask')
      s.unsubscribe()
      done()
    })
  })
})
