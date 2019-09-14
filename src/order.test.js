import 'dotenv/config'
import { order, cancel, edit, stop } from './index'

jest.setTimeout(10000)

describe('order', () => {
  it('order', async done => {
    order({
      instrument_name: 'BTC-PERPETUAL',
      amount: 10,
      price: 2000,
    }).subscribe(order => {
      expect(order.order).toHaveProperty('amount', 10)
      expect(order.order).toHaveProperty('post_only', true)
      done()
    })
  })

  it('stop', async done => {
    stop({
      instrument_name: 'BTC-PERPETUAL',
      amount: -10,
      price: 2000,
    }).subscribe(order => {
      expect(order.order).toHaveProperty('order_type', 'stop_market')
      expect(order.order).toHaveProperty('trigger', 'mark_price')
      done()
    })
  })

  it('edit', async done => {
    edit({
      order_id: 14691759392,
      amount: 20,
      price: 2100,
    }).subscribe(order => {
      expect(order.order).toHaveProperty('amount', 20)
      expect(order.order).toHaveProperty('price', 2100)
      done()
    })
  })

  it('cancel', async done => {
    cancel(14691819497).subscribe(order => {
      expect(order).toHaveProperty('order_state', 'cancelled')
      done()
    })
  })
})
