# Framework for building apps with yjs & react

Real-time, collaborative, local-first

Proviedes:
- server which provides websocket for connecting users + persists yjs data + optionally supports authentication
with etherum wallets and other providers
- react hooks for using yjs data and subscribing to updates
- react hooks for optional authentication support

## Installation

`npm install situated`

## Usage

### Server

```ts
import {Server, onConnect, extendApi} from situated"

// TODO figure out how to subscribe to data changes on the server.
// e.g. it'd be interesting to post to Farcaster every time something happens
// e.g. once a day, post that day's mood.

const app = new Server()

app.on(`listen`, (server) => {
  console.log(`server is listening on ${server.port}`)
})
```

### Client

Stay as close to yjs as possible.

whatsthemood.com
whatsthevibe.com
huh... login with wallet to track your mood over time.
```tsx
import * as React from "react"
import { useSubscribeYjs, useAwarenessStates } from "situated"

// UI where can use can pick their current mood from 5 emoji
// show active clients' moods.
// permanent log of each mood & total number of unique sessions & moods
// Maybe a bar chart of current moods & weekly chart of moods.
// How much data would this use w/ say 10k logged moods?
```

### Awareness
Ephermal data

### State
app doc created by default.

convention is to create a "state" map and put all app state on it. Only need multiple
docs if only allowing some users access to certain docs.

YJS types

## Authentication

## Components
Remirror / Prosemirror integration that isn't dependent on using a single doc.
