import 'dotenv/config'
import { price } from './index'
import ws from './deribit'

describe('price', () => {
  afterAll(() => {
    ws.disconnect()
    ws.close()
  })

  it('one instrument', done => {
    const btc$ = price()
    const s = btc$.subscribe(price => {
      expect(price).toHaveProperty('instrument')
      expect(price).toHaveProperty('bid')
      expect(price).toHaveProperty('mid')
      expect(price).toHaveProperty('ask')
      s.unsubscribe()
      done()
    })
  })

  it('options', done => {
    const options$ = price('options')
    const s = options$.subscribe(price => {
      expect(price).toHaveProperty('instrument')
      expect(price.instrument).not.toBe('BTC-PERPETUAL')
      expect(price).toHaveProperty('bid')
      expect(price).toHaveProperty('mid')
      expect(price).toHaveProperty('ask')
      s.unsubscribe()
      done()
    })
  })
})
