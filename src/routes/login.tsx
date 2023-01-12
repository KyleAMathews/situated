import React from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
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
import { useAccount } from 'wagmi'
import { useAuth } from '../situated'

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
function Login(props) {
  const accountInfo = useAccount()

  const { authenticationStatus, setAuthenticationStatus, setAccountInfo } =
    useAuth()
  React.useEffect(() => {
    if (accountInfo) {
      const { address, ...otherInfo } = accountInfo
      setAccountInfo(() => {
        return { address }
      })
    }
  }, [accountInfo.address])
  const authenticationAdapter = createAuthenticationAdapter({
    getNonce: async () => {
      siweModule = await import(`siwe`)
      const response = await fetch(`${BACKEND_ADDR}nonce`, {
        credentials: `include`,
      })

      const nonce = await response.text()
      console.log({ nonce })
      return nonce
    },

    createMessage: ({ nonce, address, chainId }) => {
      console.log(`createMessage`, { nonce, address, chainId })
      try {
        const message = new siweModule.SiweMessage({
          domain: window.location.host,
          address,
          statement: `Sign in with Ethereum to the app.`,
          uri: window.location.origin,
          version: `1`,
          chainId,
          nonce,
        })
        return message
      } catch (e) {
        console.log(e)
      }
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
      localStorage.clear()
      await fetch(`${BACKEND_ADDR}logout`)
    },
  })
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitAuthenticationProvider
        adapter={authenticationAdapter}
        status={authenticationStatus}
      >
        <RainbowKitProvider chains={chains} modalSize="compact">
          <div>
            <h1>Login</h1>
            <ConnectButton />
          </div>
        </RainbowKitProvider>
      </RainbowKitAuthenticationProvider>
    </WagmiConfig>
  )
}

export default Login
