import * as React from 'react'
import * as Y from 'yjs'
import { WebsocketProvider } from './y-socket-client'
import * as awarenessProtocol from 'y-protocols/awareness.js'
import { useLocalStorage } from 'usehooks-ts'

import { YJSStateContext } from './state-context'
const port = import.meta.env.PROD ? location.port : `3000`
const url = `${location.protocol}://${location.hostname}:${port}`
const BACKEND_ADDR = new URL(
  `${location.protocol}//${location.hostname}:${port}`,
).href

const roomId = `app`

// Create the parent doc
const rootDoc = new Y.Doc()

const href = new URL(
  `${location.protocol === `https:` ? `wss:` : `ws:`}//${
    location.hostname
  }:${port}`,
).href
const wsProvider = new WebsocketProvider(href, roomId, rootDoc, {
  awareness: new awarenessProtocol.Awareness(rootDoc),
})

let dResolve
const synced = new Promise((resolve) => {
  dResolve = resolve
})
wsProvider.on(`synced`, () => {
  console.log(`yjs synced`)
  dResolve(true)
})

export async function loader() {
  // const res = await fetch(`${BACKEND_ADDR}personal_information`, {
  // credentials: `include`,
  // })
  // if (res.ok) {
  return await synced
  // } else {
  // return null
  // }
}

wsProvider.on(`status`, (event) => {
  console.log(`wsProvider status`, event.status) // logs "connected" or "disconnected"
})

// export const entries = rootDoc.getMap(`entries`)
window.rootDoc = rootDoc

// provider
//
export function SituatedProvider({ children }) {
  const [authenticationStatus, setAuthenticationStatus] = React.useState<
    `loading` | `authenticated` | `unauthenticated`
  >(`loading`)
  const [accountInfo, setAccountInfo] = useLocalStorage(`accountInfo`, {})

  React.useEffect(() => {
    const fetchAuthStatus = async () => {
      const res = await fetch(`${BACKEND_ADDR}personal_information`, {
        credentials: `include`,
      })
      if (!res.ok) {
        localStorage.clear()
        setAuthenticationStatus(`unauthenticated`)
      } else {
        setAuthenticationStatus(`authenticated`)
      }
    }
    fetchAuthStatus()
  }, [])

  return (
    <YJSStateContext.Provider
      value={{
        rootDoc,
        provider: wsProvider,
        authenticationStatus,
        setAuthenticationStatus,
        accountInfo,
        setAccountInfo,
      }}
    >
      {children}
    </YJSStateContext.Provider>
  )
}
