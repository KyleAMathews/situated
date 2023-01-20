import { useContext, useCallback, useRef } from 'react'
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector'
import { type Awareness } from 'y-protocols/awareness'
import { YJSStateContext } from './state-context'
import { useAwarenessStates } from './use-awareness.ts'

export function useMe(): UsersSnapshot

export function useMe(): Record<any, any> {
  const { provider } = useContext(YJSStateContext)
  const awareness = provider.awareness as Awareness
  return useAwarenessStates((clients) => clients.get(awareness.clientID))
}
