import { useContext, useCallback, useRef } from 'react'
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector'
import { type Awareness } from 'y-protocols/awareness'
import { YJSStateContext } from './state-context'

type UsersSnapshot = ReturnType<Awareness[`getStates`]>

export function useAwarenessStates(): UsersSnapshot

export function useAwarenessStates<Selection>(
  selector: (state: UsersSnapshot) => Selection,
  compare?: (a: Selection, b: Selection) => boolean,
): Selection

export function useAwarenessStates<Selection>(
  selector: (state: UsersSnapshot) => Selection = (state) => state as Selection,
  compare?: (a: Selection, b: Selection) => boolean,
): Selection {
  const { provider } = useContext(YJSStateContext)
  const awareness = provider.awareness as Awareness
  const stateRef = useRef<ReturnType<Awareness[`getStates`]>>()

  if (!stateRef.current) {
    stateRef.current = new Map(awareness.getStates())
  }

  const getSnapshot = useCallback(() => {
    if (!stateRef.current) return new Map()
    return stateRef.current
  }, [])

  const state = useSyncExternalStoreWithSelector(
    (callback) => subscribe(awareness, callback),
    getSnapshot,
    getSnapshot,
    selector,
    compare,
  )

  const subscribe = useCallback(
    (awareness: Awareness, callback: () => void) => {
      const onChange = () => {
        stateRef.current = new Map(awareness.getStates())
        callback()
      }

      awareness.on(`change`, onChange)
      return () => awareness.off(`change`, onChange)
    },
    [],
  )

  return state
}
