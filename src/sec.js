import { timer } from 'rxjs'
import { filter, share, map } from 'rxjs/operators'

let last = Math.floor(new Date().getTime() / 1000) * 1000

export default timer(new Date(last), 333).pipe(
  map(() => Math.floor(new Date().getTime() / 1000) * 1000),
  filter(tsms => {
    if (tsms > last) {
      last = tsms
      return true
    }
    return false
  }),
  share(),
)
