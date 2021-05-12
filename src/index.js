import sec$ from './sec'
import quote from './quote'
import orders$ from './orders'
import trades$ from './trades'
import positions$ from './positions'
import index from './indx'
import { msg, close, deribit$, authenticate } from './deribit'
import { order, edit, cancel, stop } from './order'

const deribit = {
  msg,
  close,
  deribit$,
  authenticate,
}

export {
  quote,
  index,
  positions$,
  orders$,
  trades$,
  sec$,
  order,
  edit,
  cancel,
  stop,
  deribit,
}
