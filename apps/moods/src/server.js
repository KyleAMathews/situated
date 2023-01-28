import cors from 'cors'
import path from 'path'
import express from 'express'
import { WebSocketServer } from 'ws'
import { fileURLToPath } from 'url'
import fs from 'fs-extra'
import { setupWSConnection } from 'situated'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const baseDir =
  process.env.BASE_DATA_DIR || path.resolve(process.cwd(), `.cache`)
const file = path.join(baseDir, `db.json`)
fs.ensureDirSync(path.dirname(file))

const app = express()
app.use(express.json())
app.use(
  cors({
    origin: `http://localhost:5174`,
    credentials: true,
  }),
)

app.get(`/personal_information`, function (req, res) {
  res.setHeader(`Content-Type`, `text/plain`)
  res.send(`You are authenticated`)
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
// process.exit(0)
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
