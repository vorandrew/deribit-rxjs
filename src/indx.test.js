import 'dotenv/config'
import { index } from './index'
import ws from './deribit'

describe('index', () => {
  afterAll(() => {
    ws.disconnect()
    ws.close()
  })

  it('index', done => {
    const index$ = index()
    const s = index$.subscribe(value => {
      expect(value).toBeGreaterThan(3000)
      s.unsubscribe()
      done()
    })
  })
})
