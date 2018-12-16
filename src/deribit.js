import Deribit from 'deribit-ws-nodejs'

export default new Deribit({
  key: process.env.DERIBIT_KEY,
  secret: process.env.DERIBIT_SECRET,
})
