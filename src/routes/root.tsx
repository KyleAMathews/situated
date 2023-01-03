import * as React from "react"
import * as Y from "yjs"
import { Outlet, Link, Form, useLoaderData } from "react-router-dom"
import "../App.css"
import { rootDoc, createEntry } from "../doc-factory"

export async function loader() {
  // return { entries }
  return null
}

export async function action() {
  const entry = createEntry()
  return { entry }
}

function App() {
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

  return (
    <div className="App">
      <div>
        <ul>
          <Form method="post">
            <button type="submit">New entry</button>
          </Form>
          {Object.values(entries).map((entry: Y.Map) => {
            return (
              <li key={entry.id}>
                <Link to={`entries/${entry.id}`}>Entry {entry.id}</Link>
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
