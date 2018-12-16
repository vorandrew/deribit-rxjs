import Debug from 'debug'

export const debugName = name => {
  const debug = new Debug(`deribit-rxjs:${name}`)
  return val => debug(new Date(), val)
}

export const debugNameObj = (name, obj) => {
  const debug = new Debug(`deribit-rxjs:${name}`)
  return val => debug(new Date(), obj, val)
}
