import 'dotenv/config'
import { index, deribit } from './'

jest.setTimeout(10000)

describe('index', () => {
  it('index', done => {
    const s = index('eth').subscribe(x => {
      expect(x).toBeGreaterThan(0)
      s.unsubscribe()
      deribit.close()
      done()
    })
  })
})
