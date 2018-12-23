export default {
  s5$: { prev: 's1$', seconds: 5 },
  s15$: { prev: 's5$', seconds: 15 },
  s30$: { prev: 's15$', seconds: 30 },
  m1$: { prev: 's30$', seconds: 60 * 1 },
  m5$: { prev: 'm1$', seconds: 60 * 5 },
  m15$: { prev: 'm5$', seconds: 60 * 15 },
  m30$: { prev: 'm15$', seconds: 60 * 30 },
  h1$: { prev: 'm30$', seconds: 60 * 60 * 1 },
  h4$: { prev: 'h1$', seconds: 60 * 60 * 4 },
  d1$: { prev: 'h4$', seconds: 60 * 60 * 24 },
}
