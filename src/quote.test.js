import 'dotenv/config'
import { quote } from './'

jest.setTimeout(10000)

describe('quote', () => {
  it('quote', async done => {
    const s = quote('BTC-PERPETUAL').subscribe(one => {
      expect(one).toHaveProperty('instrument_name', 'BTC-PERPETUAL')
      expect(one).toHaveProperty('bid')
      expect(one).toHaveProperty('ask')
      expect(one).toHaveProperty('bid_amount')
      expect(one).toHaveProperty('ask_amount')
      s.unsubscribe()
      done()
    })
  })
})
