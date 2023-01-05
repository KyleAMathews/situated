import cors from "cors"
import path from "path"
import express from "express"
import Session from "express-session"
import { generateNonce, ErrorTypes, SiweMessage } from "siwe"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(express.json())
app.use(
  cors({
    origin: `http://localhost:5173`,
    credentials: true,
  })
)

app.use(
  Session({
    name: `siwe-quickstart`,
    secret: `siwe-quickstart-secret`,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false, sameSite: true },
  })
)

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
  console.log(`User is authenticated!`)
  res.setHeader(`Content-Type`, `text/plain`)
  res.send(
    `You are authenticated and your address is: ${req.session.siwe.address}`
  )
})

// Serve static assets.
app.use(`/`, express.static(path.join(__dirname, `../dist`)))

// handle every other route with index.html, which will contain
// a script tag to your application's JavaScript file(s).
app.get(`*`, function (request, response) {
  response.sendFile(path.resolve(__dirname, `../dist/index.html`))
})

let port = 3000
if (process.env.NODE_ENV === `production`) {
  port = 4000
}

app.listen(port, () => {
  console.log(`API listening on port ${port}`)
})
