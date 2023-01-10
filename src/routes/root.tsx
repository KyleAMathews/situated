import * as React from 'react'
import * as Y from 'yjs'
import { Outlet, Link, Form, useNavigate, useLocation } from 'react-router-dom'
import '../App.css'
import { useSelf, useYjsData, useUsers } from '../hooks'
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
  const awarenessUsers = useUsers(awareness)
  const profile = useYjsData(users, (users) => {
    return users[accountInfo.address]
  })
  const authStatus = React.useContext(AuthenticationStatus)
  const entriesMap = rootDoc.get(`entries`)
  const entries = useYjsData(entriesMap)
  const typesMap = rootDoc.getMap(`types`)
  const eventTypes = useYjsData(typesMap)

  // Redirect to login if not logged in.
  React.useEffect(() => {
    if (authStatus === `unauthenticated` && location.pathname !== `/login`) {
      navigate(`/login`)
    } else if (authStatus === `authenticated`) {
      awareness.setLocalState({
        ...awareness.getLocalState(),
        online: true,
      })
    }
  }, [authStatus])

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
            <Text size="extraSmall">{awarenessUsers.size} people online</Text>
          </Stack>
          <div
            style={{
              display: location.pathname === `/` ? `block` : `none`,
            }}
          >
            <Stack space="1">
              <table style={{ width: 8 * 60 }}>
                <thead>
                  <tr>
                    <td>Type</td>
                    <td>Time</td>
                    <td>Creator</td>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(entries)
                    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
                    .map((entry: Y.Map) => {
                      return (
                        <tr key={entry.id}>
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
                </tbody>
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
                  {Object.values(eventTypes).map((type) => (
                    <option key={type.name} value={type.name}>
                      {type.name}
                    </option>
                  ))}
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
