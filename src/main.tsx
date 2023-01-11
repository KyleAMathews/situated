import { ThemeProvider } from 'degen'
import 'degen/styles'
import './polyfills'
import React, { lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Root from './routes/root'
import { SituatedProvider, loader as docLoader } from './situated'
import ErrorPage from './error-page'
import '@rainbow-me/rainbowkit/styles.css'
import {
  RainbowKitProvider,
  createAuthenticationAdapter,
  RainbowKitAuthenticationProvider,
} from '@rainbow-me/rainbowkit'
import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import { rainbowWallet } from '@rainbow-me/rainbowkit/wallets'
import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { AuthenticationStatus } from './auth-status'
import '@fontsource/inter/variable-full.css'

const { chains, provider } = configureChains(
  [mainnet],
  [alchemyProvider({ apiKey: `03yzRcU8w9JY4Ro3kBH2C_O0lqJuMQ_b` })],
)

const connectors = connectorsForWallets([
  {
    groupName: `Recommended`,
    wallets: [rainbowWallet({ chains })],
  },
])

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
})

const port = import.meta.env.PROD ? location.port : `3000`
const BACKEND_ADDR = new URL(
  `${location.protocol}//${location.hostname}:${port}`,
).href

let siweModule
function Auth({ children }) {
  const [authenticationStatus, setAuthenticationStatus] = React.useState<
    `loading` | `authenticated` | `unauthenticated`
  >(`loading`)

  const authenticationAdapter = createAuthenticationAdapter({
    getNonce: async () => {
      siweModule = await import(`siwe`)
      const response = await fetch(`${BACKEND_ADDR}nonce`, {
        credentials: `include`,
      })

      return await response.text()
    },

    createMessage: ({ nonce, address, chainId }) => {
      console.log({ siweModule })
      return new siweModule.SiweMessage({
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
      const verifyRes = await fetch(`${BACKEND_ADDR}verify`, {
        method: `POST`,
        headers: {
          'Content-Type': `application/json`,
        },
        body: JSON.stringify({ message, signature }),
        credentials: `include`,
      })

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
      if (!res.ok) {
        setAuthenticationStatus(`unauthenticated`)
      } else {
        setAuthenticationStatus(`authenticated`)
      }
    }
    fetchAuthStatus()
  }, [])

  return (
    <AuthenticationStatus.Provider value={authenticationStatus}>
      <RainbowKitAuthenticationProvider
        adapter={authenticationAdapter}
        status={authenticationStatus}
      >
        {children}
      </RainbowKitAuthenticationProvider>
    </AuthenticationStatus.Provider>
  )
}

const LazyLogin = lazy(() => import(`./routes/login`))
const LazyStyleGuide = lazy(() => import(`./routes/styleguide`))
const LazySettings = lazy(() => import(`./routes/settings`))
const LazyMigrate = lazy(() => import(`./routes/migrate`))

const router = createBrowserRouter([
  {
    path: `/`,
    element: <Root />,
    loader: docLoader,
    errorElement: <ErrorPage />,
    children: [
      {
        path: `settings`,
        element: <LazySettings />,
        loader: docLoader,
      },
      {
        path: `/login`,
        element: <LazyLogin />,
        // loader: entryLoader,
      },
      {
        path: `/styleguide`,
        element: <LazyStyleGuide />,
        // loader: entryLoader,
      },
      {
        path: `/migrate`,
        element: <LazyMigrate />,
        loader: docLoader,
      },
    ],
  },
])

ReactDOM.createRoot(document.getElementById(`root`) as HTMLElement).render(
  <SituatedProvider>
    <ThemeProvider>
      <WagmiConfig client={wagmiClient}>
        <Auth>
          <RainbowKitProvider chains={chains} modalSize="compact">
            <RouterProvider router={router} />
          </RainbowKitProvider>
        </Auth>
      </WagmiConfig>
    </ThemeProvider>
    ,
  </SituatedProvider>,
)
