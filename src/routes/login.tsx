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
import { AuthenticationStatus } from '../auth-status'
import { useAccount } from 'wagmi'

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

function Login(props) {
  const accountInfo = useAccount()

  let siweModule
  const { authenticationStatus, setAuthenticationStatus, setAccountInfo } =
    React.useContext(AuthenticationStatus)
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

      return await response.text()
    },

    createMessage: ({ nonce, address, chainId }) => {
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
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains} modalSize="compact">
        <RainbowKitAuthenticationProvider
          adapter={authenticationAdapter}
          status={authenticationStatus}
        >
          <div>
            <h1>Login</h1>
            <ConnectButton />
          </div>
        </RainbowKitAuthenticationProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  )
}

export default Login
