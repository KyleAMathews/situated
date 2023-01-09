import * as React from 'react'
import * as Y from 'yjs'
import { Outlet, Link, Form, useNavigate, useLocation } from 'react-router-dom'
import '../App.css'
import { rootDoc, awareness } from '../doc-factory'
import { useAccount } from 'wagmi'
import { AuthenticationStatus } from '../auth-status'
import { Text, Heading, Box, Avatar, IconLockClosed, Stack } from 'degen'
// import * as Components from "../styles/base-components"
// import * as styles from "./base-components.css"
import { fontStyles } from '../styles/typography.css'
import * as Components from '../styles/base-components'
import * as rootStyles from '../styles/root.css'
import '../styles/app.css'

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const accountInfo = useAccount()
  const users = rootDoc.getMap(`users`)
  const profile = users.get(accountInfo.address)
  const authStatus = React.useContext(AuthenticationStatus)
  // TODO parent doc w/ array of log entries — button to create the new entry creates the entry
  // and then navigates to it.
  // const { entries } = useLoaderData()
  const entriesMap = rootDoc.get(`entries`)
  const [entries, setEntries] = React.useState(entriesMap.toJSON())
  console.log({ users: awareness.getStates() })

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
    if (authStatus === `unauthenticated` && location.pathname !== `/login`) {
      navigate(`/login`)
    }
  }, [authStatus])

  // Only init if logged in, useEffect w/ token as the comparision

  return (
    <div className="App">
      <Box padding="4">
        <Stack>
          <Stack direction="horizontal" align="center">
            <Text>
              <Link to="/">Life Logger</Link>
            </Text>
            <Text size="extraSmall">
              {profile?.name || accountInfo.address}
            </Text>
            <Avatar
              address={accountInfo.address}
              size="6"
              src={profile?.avatar}
            />
            <Link to="/settings">Settings</Link>
            <Text size="extraSmall">
              {awareness.getStates().size} people online
            </Text>
          </Stack>
          <div
            style={{
              display: location.pathname === `/` ? `block` : `none`,
            }}
          >
            <Stack space="1">
              <table style={{ width: 8 * 40 }}>
                {Object.values(entries)
                  .sort((a, b) => a.created_at > b.created_at)
                  .reverse()
                  .map((entry: Y.Map) => {
                    return (
                      <tr>
                        <td>{entry.type}</td>
                        <td>
                          {new Date(entry.created_at).toLocaleDateString()}
                          {` `}
                          {new Date(entry.created_at).toLocaleTimeString()}
                        </td>
                        <td>
                          {users.get(entry.creator)?.name || entry.creator}
                        </td>
                      </tr>
                    )
                  })}
              </table>
            </Stack>
          </div>
          <Box
            style={{
              display: location.pathname === `/` ? `block` : `none`,
            }}
            width="64"
          >
            <Form method="post">
              <Stack space="2">
                <h3 className={fontStyles.INTER_LARGE}>New event</h3>
                <input
                  type="hidden"
                  id="wallet"
                  name="wallet"
                  value={accountInfo.address}
                />
                <select name="type">
                  {Object.values(rootDoc.getMap(`types`).toJSON()).map(
                    (type) => (
                      <option key={type.name} value={type.name}>
                        {type.name}
                      </option>
                    ),
                  )}
                </select>
                <button size="small" type="submit">
                  Submit
                </button>
              </Stack>
            </Form>
          </Box>
          <React.Suspense>
            <Outlet />
          </React.Suspense>
        </Stack>
      </Box>
    </div>
  )
}

export default App
