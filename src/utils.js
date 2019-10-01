import deribit from './deribit'

// export const currencies$ = from(
//   deribit.connectedPromise.then(() =>
//     deribit
//       .msg({ method: 'public/get_currencies' })
//       .then(all => all.map(o => o.currency)),
//   ),
// ).pipe(shareReplay(1))

export const currencies = deribit.connectedPromise.then(() =>
  deribit.msg({ method: 'public/get_currencies' }).then(all => all.map(o => o.currency)),
)
