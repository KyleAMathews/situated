import * as React from 'react'
import * as Y from 'yjs'
import { WebsocketProvider } from './y-socket-client'
import * as awarenessProtocol from 'y-protocols/awareness.js'
// import { useLocalStorage } from 'usehooks-ts'

import { YJSStateContext } from './state-context'
const port = import.meta.env.PROD ? location.port : `3000`
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
  return await synced
}

wsProvider.on(`status`, (event) => {
  console.log(`wsProvider status`, event.status) // logs "connected" or "disconnected"
})

window.rootDoc = rootDoc

// provider
export function SituatedProvider({ children }) {
  // const [accountInfo, setAccountInfo] = useLocalStorage(`accountInfo`, {})

  return (
    <YJSStateContext.Provider
      value={{
        rootDoc,
        provider: wsProvider,
        // accountInfo,
        // setAccountInfo,
      }}
    >
      {children}
    </YJSStateContext.Provider>
  )
}
