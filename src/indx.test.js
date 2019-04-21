import 'dotenv/config'
import { index } from './'

jest.setTimeout(10000)

describe('index', () => {
  it('index', async done => {
    const s = index('eth').subscribe(x => {
      expect(x).toBeGreaterThan(0)
      s.unsubscribe()
      done()
    })
  })
})
