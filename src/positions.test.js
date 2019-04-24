import 'dotenv/config'
import { positions$ } from './index'
import { msg, authedPromise } from './deribit'

jest.setTimeout(10000)

describe('positions', () => {
  it('positions', async done => {
    const s = positions$.subscribe(positions => {
      expect(positions.length).toBeGreaterThan(0)
      const one = positions.filter(one => one.instrument_name === 'BTC-PERPETUAL')[0]
      expect(one).toHaveProperty('kind', 'future')
      expect(one).toHaveProperty('size')
      s.unsubscribe()
      done()
    })

    await authedPromise.then(() =>
      msg({
        method: 'private/buy',
        params: {
          instrument_name: 'BTC-PERPETUAL',
          amount: 10,
          type: 'market',
        },
      }),
    )
  })
})
