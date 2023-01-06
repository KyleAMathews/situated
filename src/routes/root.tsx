import * as React from "react"
import * as Y from "yjs"
import { Outlet, Link, Form, useNavigate, useLocation } from "react-router-dom"
import "../App.css"
import { rootDoc } from "../doc-factory"
import { useAccount } from "wagmi"

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const accountInfo = useAccount()
  console.log({ accountInfo })
  console.log({ navigate, location })
  // TODO parent doc w/ array of log entries — button to create the new entry creates the entry
  // and then navigates to it.
  // const { entries } = useLoaderData()
  const entriesMap = rootDoc.get(`entries`)
  const [entries, setEntries] = React.useState(entriesMap.toJSON())

  console.log(`root updated`, entries)
  React.useEffect(() => {
    function observer(event) {
      console.log(`entries updated`, event)
      setEntries(entriesMap.toJSON())
    }
    entriesMap.observe(observer)
    return () => entriesMap.unobserve(observer)
  }, [])

  // Am I logged in?
  const [token, setToken] = React.useState()

  React.useEffect(() => {
    if (!accountInfo.address && location.pathname !== `/login`) {
      navigate(`/login`)
    }
  }, [])

  // Only init if logged in, useEffect w/ token as the comparision

  return (
    <div className="App">
      <div>
        <ul>
          <Form method="post">
            <button type="submit">New entry</button>
          </Form>
          {Object.values(entries)
            .reverse()
            .map((entry: Y.Map) => {
              return (
                <li key={entry.id}>
                  <Link to={`entries/${entry.id}`}>
                    {new Date(entry.created_at).toLocaleDateString()}
                    {`—`}
                    {new Date(entry.created_at).toLocaleTimeString()}
                    {`—`}
                    {entry.type} [{entry.categories.join(`,`)}]
                  </Link>
                </li>
              )
            })}
        </ul>
      </div>
      <Outlet />
    </div>
  )
}

export default App
