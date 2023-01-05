import * as Y from "yjs"
// import { WebrtcProvider } from "y-webrtc"
import { WebsocketProvider } from "y-websocket"
import * as awarenessProtocol from "y-protocols/awareness.js"
import { nanoid } from "nanoid"

const roomId = `the-sample-room2`
const WEBRTC_SIGNALING_SERVERS = [
  `wss://signaling.yjs.dev`,
  `wss://y-webrtc-signaling-us.herokuapp.com`,
  `wss://y-webrtc-signaling-eu.herokuapp.com`,
]

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

const wsProvider = new WebsocketProvider(
  `ws://localhost:3000`,
  roomId,
  rootDoc,
  {
    awareness: new awarenessProtocol.Awareness(rootDoc),
  }
)
export const awareness = wsProvider.awareness

wsProvider.on(`status`, (event) => {
  console.log(event.status) // logs "connected" or "disconnected"
})

export const entries = rootDoc.getMap(`entries`)
window.rootDoc = rootDoc

export function createEntry() {
  const entry = new Y.Map()
  const id = nanoid()
  console.log({ id })
  rootDoc.transact(() => {
    entry.set(`id`, id)
    entry.set(`created_at`, new Date().toJSON())
    entry.set(`type`, `1HPW project`)
    entry.set(`title`, new Y.Text())
    entry.set(`body`, new Y.Text())
    const categories = new Y.Array()
    categories.push([`life-logger`])
    entry.set(`categories`, categories)
    entry.get(`categories`)
    entries.set(id, entry)
  })
  console.log(entry.toJSON())
  return entry
}
