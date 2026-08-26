import { useSyncExternalStore } from 'react'

const emptySubscribe = () => () => {}

/** Client-only mount flag without setState-in-effect (SSR-safe). */
export const useMounted = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
