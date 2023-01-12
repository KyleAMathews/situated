import { ThemeProvider } from 'degen'
import 'degen/styles'
import './polyfills'
import React, { lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Root from './routes/root'
import { SituatedProvider, loader as docLoader } from './situated'
import ErrorPage from './error-page'
import { AuthenticationStatus } from './auth-status'
import '@fontsource/inter/variable-full.css'
import { useLocalStorage } from 'usehooks-ts'

const port = import.meta.env.PROD ? location.port : `3000`
const BACKEND_ADDR = new URL(
  `${location.protocol}//${location.hostname}:${port}`,
).href

function Auth({ children }) {
  const [authenticationStatus, setAuthenticationStatus] = React.useState<
    `loading` | `authenticated` | `unauthenticated`
  >(`loading`)
  const [accountInfo, setAccountInfo] = useLocalStorage(`accountInfo`, {})

  React.useEffect(() => {
    const fetchAuthStatus = async () => {
      const res = await fetch(`${BACKEND_ADDR}personal_information`, {
        credentials: `include`,
      })
      if (!res.ok) {
        localStorage.clear()
        setAuthenticationStatus(`unauthenticated`)
      } else {
        setAuthenticationStatus(`authenticated`)
      }
    }
    fetchAuthStatus()
  }, [])

  return (
    <AuthenticationStatus.Provider
      value={{
        authenticationStatus,
        setAuthenticationStatus,
        accountInfo,
        setAccountInfo,
      }}
    >
      {children}
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
      <Auth>
        <RouterProvider router={router} />
      </Auth>
    </ThemeProvider>
  </SituatedProvider>,
)
