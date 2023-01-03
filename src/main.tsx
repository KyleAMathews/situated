import React from "react"
import ReactDOM from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Root from "./routes/root"
import Typography from "typography"
import { action as rootAction, loader as rootLoader } from "./routes/root"
import Entry, { loader as entryLoader } from "./routes/entry"
import ErrorPage from "./error-page"

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
    loader: rootLoader,
    errorElement: <ErrorPage />,
    children: [
      {
        path: `entries/:entryId`,
        element: <Entry />,
        loader: entryLoader,
      },
    ],
  },
])

ReactDOM.createRoot(document.getElementById(`root`) as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
