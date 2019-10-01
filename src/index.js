import sec$ from './sec'
import ohlc from './ohlc'
import quote from './quote'
import orders$ from './orders'
import trades$ from './trades'
import positions$ from './positions'
import index from './indx'
import deribitObj, { read$ } from './deribit'
import { order, edit, cancel, stop } from './order'

const deribit = {
  msg: deribitObj.msg,
  connected: deribitObj.connectedPromise,
  authenticated: deribitObj.authedPromise,
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
