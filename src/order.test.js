import 'dotenv/config'
import { order, cancel, edit, stop } from './index'

jest.setTimeout(10000)

describe('order', () => {
  it('order', done => {
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

  it('stop', done => {
    stop({
      instrument_name: 'BTC-PERPETUAL',
      amount: 10,
      price: 72000,
    }).subscribe(order => {
      expect(order.order).toHaveProperty('order_type', 'stop_market')
      expect(order.order).toHaveProperty('trigger', 'mark_price')
      done()
    })
  })

  it('edit', async done => {
    order({
      instrument_name: 'BTC-PERPETUAL',
      amount: 10,
      price: 2000,
    }).subscribe(order => {
      const order_id = order.order.order_id
      edit({
        order_id,
        amount: 20,
        price: 2100,
      }).subscribe(order => {
        expect(order.order).toHaveProperty('amount', 20)
        expect(order.order).toHaveProperty('price', 2100)
        done()
      })
    })
  })

  it('cancel', done => {
    order({
      instrument_name: 'BTC-PERPETUAL',
      amount: 10,
      price: 2000,
    }).subscribe(order => {
      const order_id = order.order.order_id
      cancel(order_id).subscribe(order => {
        expect(order).toHaveProperty('order_state', 'cancelled')
        done()
      })
    })
  })
})
