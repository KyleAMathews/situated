import * as Y from 'yjs'
import { redirect } from 'react-router-dom'
// import { WebrtcProvider } from "y-webrtc"
import { WebsocketProvider } from './y-socket-client'
import * as awarenessProtocol from 'y-protocols/awareness.js'
import { nanoid } from 'nanoid'

const port = import.meta.env.PROD ? location.port : `3000`
const url = `${location.protocol}://${location.hostname}:${port}`
const BACKEND_ADDR = new URL(
  `${location.protocol}//${location.hostname}:${port}`,
).href

const roomId = `the-sample-room2`
// const WEBRTC_SIGNALING_SERVERS = [
// `wss://signaling.yjs.dev`,
// `wss://y-webrtc-signaling-us.herokuapp.com`,
// `wss://y-webrtc-signaling-eu.herokuapp.com`,
// ]

// Create the parent doc
export const rootDoc = new Y.Doc()

// const webRTCProvider = new WebrtcProvider(roomId, rootDoc, {
// signaling: WEBRTC_SIGNALING_SERVERS,
// password: null,
// awareness: new awarenessProtocol.Awareness(rootDoc),
// maxConns: 50 + Math.floor(Math.random() * 15),
// filterBcConns: true,
// peerOpts: {},
// })

// export const awareness = webRTCProvider.awareness
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
  const res = await fetch(`${BACKEND_ADDR}personal_information`, {
    credentials: `include`,
  })
  if (res.ok) {
    return await synced
  } else {
    return null
  }
}

export const awareness = wsProvider.awareness

wsProvider.on(`status`, (event) => {
  console.log(`wsProvider status`, event.status) // logs "connected" or "disconnected"
})

export const entries = rootDoc.getMap(`entries`)
window.rootDoc = rootDoc

export function createEntry({
  walletAddress,
  type,
}: {
  walletAddress: string
  type: string
}) {
  const entry = new Y.Map()
  const id = nanoid()
  console.log({ id })
  rootDoc.transact(() => {
    entry.set(`id`, id)
    entry.set(`created_at`, new Date().toJSON())
    entry.set(`type`, type)
    entry.set(`body`, new Y.Text())
    entry.set(`creator`, walletAddress)
    entries.set(id, entry)
  })
  console.log(entry.toJSON())
  return entry
}
