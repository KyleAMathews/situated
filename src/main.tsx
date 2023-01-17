import { ThemeProvider } from 'degen'
import 'degen/styles'
import './polyfills'
import React, { lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Root from './routes/root'
import { SituatedProvider, loader as docLoader } from './situated'
import ErrorPage from './error-page'
import '@fontsource/space-mono'

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
      <RouterProvider router={router} />
    </ThemeProvider>
  </SituatedProvider>,
)
