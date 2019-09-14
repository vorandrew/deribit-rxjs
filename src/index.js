import sec$ from './sec'
import ohlc from './ohlc'
import quote from './quote'
import orders$ from './orders'
import trades$ from './trades'
import positions$ from './positions'
import index from './indx'
import { msg, read$, openPromise, authedPromise } from './deribit'
import { order, edit, cancel, stop } from './order'

const deribit = {
  msg,
  connected: openPromise,
  authenticated: authedPromise,
}

export {
  ohlc,
  quote,
  index,
  positions$,
  orders$,
  trades$,
  sec$,
  read$,
  order,
  edit,
  cancel,
  stop,
  deribit,
}
