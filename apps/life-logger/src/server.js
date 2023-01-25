import cors from 'cors'
import path from 'path'
import express from 'express'
import { WebSocketServer } from 'ws'
import Session from 'express-session'
import { generateNonce, ErrorTypes, SiweMessage } from 'siwe'
import { fileURLToPath } from 'url'
// import ySocket from './y-socket-server.cjs'
import fs from 'fs-extra'
import { setupWSConnection } from 'situated'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import lowdbStore from 'connect-lowdb'

const LowdbStore = lowdbStore(Session)

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
  cookie: { secure: false, sameSite: true },
  store: new LowdbStore({ db }),
})

app.use(sessionParser)

app.get(`/nonce`, async function (req, res) {
  req.session.nonce = generateNonce()
  res.setHeader(`Content-Type`, `text/plain`)
  res.status(200).send(req.session.nonce)
})

app.post(`/verify`, async function (req, res) {
  try {
    if (!req.body.message) {
      res
        .status(422)
        .json({ message: `Expected prepareMessage object as body.` })
      return
    }

    const message = new SiweMessage(req.body.message)
    const fields = await message.validate(req.body.signature)
    console.log(`checking address`, process.env.ALLOWED_ADDRESSES, fields)

    // If allowed wallet addresses is set, then validate agains that.
    if (process.env.ALLOWED_ADDRESSES) {
      console.log(`checking address`, process.env.ALLOWED_ADDRESSES, fields)
      if (!process.env.ALLOWED_ADDRESSES.split(`,`).includes(fields.address)) {
        res.status(401).json({
          message: `Invalid wallet address`,
        })
        return
      }
    }

    if (fields.nonce !== req.session.nonce) {
      console.log(req.session)
      res.status(422).json({
        message: `Invalid nonce.`,
      })
      return
    }
    req.session.siwe = fields
    req.session.cookie.expires = new Date(fields.expirationTime)
    req.session.save(() => res.status(200).end())
  } catch (e) {
    req.session.siwe = null
    req.session.nonce = null
    console.error(e)
    switch (e) {
      case ErrorTypes.EXPIRED_MESSAGE: {
        req.session.save(() => res.status(440).json({ message: e.message }))
        break
      }
      case ErrorTypes.INVALID_SIGNATURE: {
        req.session.save(() => res.status(422).json({ message: e.message }))
        break
      }
      default: {
        req.session.save(() => res.status(500).json({ message: e.message }))
        break
      }
    }
  }
})

app.get(`/personal_information`, function (req, res) {
  if (!req.session.siwe) {
    res.status(401).json({ message: `You have to first sign_in` })
    return
  }
  res.setHeader(`Content-Type`, `text/plain`)
  res.send(
    `You are authenticated and your address is: ${req.session.siwe.address}`,
  )
})

app.get(`/logout`, function (req, res, next) {
  console.log(`/logout`)
  console.log(req.session)
  // clear the user from the session object and save.
  // this will ensure that re-using the old session id
  // does not have a logged in user
  req.session.siwe = null
  req.session.nonce = null
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

// Serve static assets.
app.use(`/`, express.static(path.join(__dirname, `../dist`)))

// handle every other route with index.html, which will contain
// a script tag to your application's JavaScript file(s).
app.get(`*`, function (request, response) {
  response.sendFile(path.resolve(__dirname, `../dist/index.html`))
})

const wsServer = new WebSocketServer({ noServer: true })
wsServer.on(`connection`, setupWSConnection)

// Shutdown the server when there's no connections.
let noClientCount = 0
setInterval(() => {
  const clientCount = wsServer.clients.size
  if (clientCount === 0) {
    noClientCount += 1
  } else {
    noClientCount = 0
  }

  // If the server has had no connections for more than two checks, shutdown gracefully.
  if (process.env.NODE_ENV === `production` && noClientCount === 2) {
    process.exit(0)
  }
}, 30000)

let port = 3000
if (process.env.NODE_ENV === `production`) {
  port = 4000
}

const server = app.listen(port, () => {
  console.log(`API listening on port ${port}`)
})

server.on(`upgrade`, (request, socket, head) => {
  sessionParser(request, {}, () => {
    if (!request.session?.siwe?.address) {
      socket.write(`HTTP/1.1 401 Unauthorized\r\n\r\n`)
      socket.destroy()
      return
    }
    wsServer.handleUpgrade(request, socket, head, (socket) => {
      console.log(`handleUpgrade`)
      wsServer.emit(`connection`, socket, request)
    })
  })
})
