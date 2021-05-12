import 'dotenv/config'
import { quote } from './'

jest.setTimeout(10000)

describe('quote', () => {
  it('one', async done => {
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

  it('futures', async done => {
    const s = quote('future').subscribe(one => {
      expect(one).toHaveProperty('instrument_name')
      expect(one.instrument_name).toMatch(/BTC-\d\d...\d\d/)
      expect(one).toHaveProperty('bid')
      expect(one).toHaveProperty('ask')
      expect(one).toHaveProperty('bid_amount')
      expect(one).toHaveProperty('ask_amount')
      s.unsubscribe()
      done()
    })
  })

  it('options', async done => {
    const s = quote('option').subscribe(one => {
      expect(one).toHaveProperty('instrument_name')
      expect(one.instrument_name).toMatch(/BTC-\d{1,2}...\d\d-[\d]+-[PC]/)
      expect(one).toHaveProperty('bid')
      expect(one).toHaveProperty('ask')
      expect(one).toHaveProperty('bid_amount')
      expect(one).toHaveProperty('ask_amount')
      s.unsubscribe()
      done()
    })
  })
})
