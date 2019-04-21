import Debug from 'debug'

export const debug = Debug('deribit-rxjs:global')

export const debugName = name => {
  const debug = new Debug(`deribit-rxjs:${name}`)
  return val => debug(val, new Date())
}

export const debugNameObj = (name, obj) => {
  const debug = new Debug(`deribit-rxjs:${name}`)
  return val => debug(new Date(), obj, val)
}
