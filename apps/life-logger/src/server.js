import cors from 'cors'
import path from 'path'
import express from 'express'
import { WebSocketServer } from 'ws'
import { fileURLToPath } from 'url'
import fs from 'fs-extra'
import { setupWSConnection } from 'situated'
import Session from 'express-session'

// LowDb
import { Writer } from 'steno'

// Fixes for nft
// LMDB
import { readFileSync } from 'fs'
import { join } from 'path'
try {
  readFileSync(join(process.cwd(), `node_modules/lmdb/dict/dict.txt`))
} catch (e) {
  // ignore
}

import 'object-assign'

import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import lowdbStore from 'connect-lowdb'

const LowdbStore = lowdbStore(Session)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const baseDir =
  process.env.BASE_DATA_DIR || path.resolve(process.cwd(), `.cache`)
const file = path.join(baseDir, `db.json`)
fs.ensureDirSync(path.dirname(file))

// Configure lowdb to write to JSONFile
const adapter = new JSONFile(file)
const db = new Low(adapter)

const app = express()
app.use(express.json())
app.use(
  cors({
    origin: `http://localhost:5173`,
    credentials: true,
  }),
)
const sessionParser = Session({
  name: `life-logger`,
  secret: `siwe-quickstart-secret`,
  resave: true,
  saveUninitialized: true,
  // One Month session
  cookie: { secure: false, sameSite: true, maxAge: 30 * 24 * 60 * 60 * 1000 },
  store: new LowdbStore({ db }),
})

app.use(sessionParser)

app.use(function (req, res, next) {
  if (!req.session.loggedIn) {
    req.session.loggedIn = false
  }

  next()
})

app.get(`/personal_information`, function (req, res) {
  if (!req.session.loggedIn) {
    res.status(401).json({ message: `You have to first sign_in` })
    return
  }
  res.setHeader(`Content-Type`, `text/plain`)
  res.send(`You are authenticated`)
})

app.get(`/logout`, function (req, res, next) {
  console.log(`/logout`)
  console.log(req.session)
  // clear the user from the session object and save.
  // this will ensure that re-using the old session id
  // does not have a logged in user
  req.session.loggedIn = false
  req.session.save(function (err) {
    console.log({ err })
    if (err) next(err)

    // regenerate the session, which is good practice to help
    // guard against forms of session fixation
    req.session.regenerate(function (err) {
      if (err) next(err)
      res.send(`logged out`)
    })
  })
})

app.post(`/magic-phrase-login`, function (req, res) {
  const input = req.body.input
  const phrase = input.split(` `)[0]
  const name = input.split(` `)[1]
  console.log({ phrase, name })
  if (
    phrase === `my-magic-phrase-is-good` &&
    [`Kyle`, `Shannon`].includes(name)
  ) {
    req.session.loggedIn = true
    return req.session.save(() => res.json({ name, worked: true }))
  } else {
    return res.json({ worked: false })
  }
})

// Serve static assets.
app.use(`/`, express.static(path.join(__dirname, `../dist`)))

// handle every other route with index.html, which will contain
// a script tag to your application's JavaScript file(s).
app.get(`*`, function (request, response) {
  response.sendFile(path.resolve(__dirname, `../dist/index.html`))
})

const wsServer = new WebSocketServer({ noServer: true })
wsServer.on(`connection`, setupWSConnection)

// TODO restore this when migrate to a fly.io machine.
// Shutdown the server when there's no connections.
// let noClientCount = 0
// setInterval(() => {
// const clientCount = wsServer.clients.size
// if (clientCount === 0) {
// noClientCount += 1
// } else {
// noClientCount = 0
// }

// // If the Fly server has had no connections for more than two checks,
// // shutdown gracefully.
// if (process.env.FLY_APP_NAME && noClientCount === 2) {
// console.log(`There are no connected clients, exiting`)
// process.exit()
// }
// }, 30000)

let port = 3000
if (process.env.NODE_ENV === `production`) {
  port = 4000
}

const server = app.listen(port, () => {
  console.log(`API listening on port ${port}`)
})

server.on(`upgrade`, (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, (socket) => {
    console.log(`handleUpgrade`)
    wsServer.emit(`connection`, socket, request)
  })
})
