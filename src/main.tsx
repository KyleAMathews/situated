import "./polyfills"
import React from "react"
import ReactDOM from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Root from "./routes/root"
import Typography from "typography"
import { action as rootAction } from "./routes/root.action"
import { loader as docLoader } from "./doc-factory"
import Entry from "./routes/entry"
import Login from "./routes/login"
import ErrorPage from "./error-page"
import "@rainbow-me/rainbowkit/styles.css"
import { SiweMessage } from "siwe"
import {
  getDefaultWallets,
  RainbowKitProvider,
  createAuthenticationAdapter,
  RainbowKitAuthenticationProvider,
} from "@rainbow-me/rainbowkit"
import { configureChains, createClient, WagmiConfig } from "wagmi"
import { mainnet } from "wagmi/chains"
import { alchemyProvider } from "wagmi/providers/alchemy"
import { publicProvider } from "wagmi/providers/public"

const { chains, provider } = configureChains(
  [mainnet],
  [
    alchemyProvider({ apiKey: `03yzRcU8w9JY4Ro3kBH2C_O0lqJuMQ_b` }),
    // alchemyProvider({ apiKey: `_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC` }),
    publicProvider(),
  ]
)

const { connectors } = getDefaultWallets({
  appName: `Life Logger`,
  chains,
})

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
})

const port = import.meta.env.PROD ? location.port : `3000`
const url = `${location.protocol}://${location.hostname}:${port}`
console.log({ port, importy: import.meta, url })
const BACKEND_ADDR = new URL(
  `${location.protocol}//${location.hostname}:${port}`
).href

function Auth({ children }) {
  console.log({ children })
  const [authenticationStatus, setAuthenticationStatus] = React.useState<
    `loading` | `authenticated` | `unauthenticated`
  >(`loading`)
  console.log({ authenticationStatus })

  const authenticationAdapter = createAuthenticationAdapter({
    getNonce: async () => {
      console.log(`getNonce`)
      const response = await fetch(`${BACKEND_ADDR}nonce`, {
        credentials: `include`,
      })

      return await response.text()
    },

    createMessage: ({ nonce, address, chainId }) => {
      return new SiweMessage({
        domain: window.location.host,
        address,
        statement: `Sign in with Ethereum to the app.`,
        uri: window.location.origin,
        version: `1`,
        chainId,
        nonce,
      })
    },

    getMessageBody: ({ message }) => {
      return message.prepareMessage()
    },

    verify: async ({ message, signature }) => {
      console.log(`verify`)
      const verifyRes = await fetch(`${BACKEND_ADDR}verify`, {
        method: `POST`,
        headers: {
          "Content-Type": `application/json`,
        },
        body: JSON.stringify({ message, signature }),
        credentials: `include`,
      })

      console.log({ verifyRes })
      if (verifyRes.ok) {
        setAuthenticationStatus(`authenticated`)
      }
      return Boolean(verifyRes.ok)
    },

    signOut: async () => {
      await fetch(`${BACKEND_ADDR}logout`)
    },
  })
  React.useEffect(() => {
    const fetchAuthStatus = async () => {
      const res = await fetch(`${BACKEND_ADDR}personal_information`, {
        credentials: `include`,
      })
      console.log({ res })
      // const data = await res.json()
      // console.log({ data })
      if (!res.ok) {
        setAuthenticationStatus(`unauthenticated`)
      } else {
        setAuthenticationStatus(`authenticated`)
      }
    }
    fetchAuthStatus()
  }, [])

  return (
    <RainbowKitAuthenticationProvider
      adapter={authenticationAdapter}
      status={authenticationStatus}
    >
      {children}
    </RainbowKitAuthenticationProvider>
  )
}

const typography = new Typography({
  baseFontSize: `18px`,
  baseLineHeight: 1.45,
  headerFontFamily: [
    `Avenir Next`,
    `Helvetica Neue`,
    `Segoe UI`,
    `Helvetica`,
    `Arial`,
    `sans-serif`,
  ],
  bodyFontFamily: [`Georgia`, `serif`],
})

typography.injectStyles()

const router = createBrowserRouter([
  {
    path: `/`,
    element: <Root />,
    action: rootAction,
    loader: docLoader,
    errorElement: <ErrorPage />,
    children: [
      {
        path: `entries/:entryId`,
        element: <Entry />,
        loader: docLoader,
      },
      {
        path: `/login`,
        element: <Login />,
        // loader: entryLoader,
      },
    ],
  },
])

const AUTHENTICATION_STATUS = `unauthenticated`

ReactDOM.createRoot(document.getElementById(`root`) as HTMLElement).render(
  <WagmiConfig client={wagmiClient}>
    <Auth>
      <RainbowKitProvider chains={chains}>
        <RouterProvider router={router} />
      </RainbowKitProvider>
    </Auth>
  </WagmiConfig>
)
