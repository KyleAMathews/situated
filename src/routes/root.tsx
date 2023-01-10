import * as React from 'react'
import * as Y from 'yjs'
import { Outlet, Link, Form, useNavigate, useLocation } from 'react-router-dom'
import '../App.css'
import { useSelf, useYjsData, useUsers } from '../hooks'
import { rootDoc, awareness } from '../doc-factory'
import { useAccount } from 'wagmi'
import { AuthenticationStatus } from '../auth-status'
import { Heading, Box, Avatar, IconLockClosed, Stack } from 'degen'
import { groupBy } from 'lodash'
import { Text } from '../components'
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
  const eventsMap = rootDoc.get(`entries`)
  const events = useYjsData(eventsMap)
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

  const eventsGroupedByDay = groupBy(Object.values(events), (event) =>
    new Date(event.created_at).toLocaleDateString(),
  )

  return (
    <div className="App">
      <Box padding="4">
        <Stack space="6">
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
            <Text>
              <Link to="/settings">Settings</Link>
            </Text>
            <Text size="extraSmall">{awarenessUsers.size} people online</Text>
          </Stack>
          <div
            style={{
              display: location.pathname === `/` ? `block` : `none`,
            }}
          >
            <Stack space="4">
              <Text>Events</Text>
              {Object.keys(eventsGroupedByDay)
                .sort()
                .map((day) => {
                  const dayEvents = eventsGroupedByDay[day]
                  dayEvents.sort((a, b) =>
                    a.created_at < b.created_at ? 1 : -1,
                  )
                  return (
                    <Stack space="2">
                      <Text>{day}</Text>
                      {dayEvents.map((event) => {
                        const user = users.get(event.creator)
                        return (
                          <Stack direction="horizontal" space="2">
                            <Avatar
                              address={user?.address}
                              size="3"
                              src={user?.avatar}
                            />
                            <Text>
                              {new Date(event.created_at).toLocaleTimeString(
                                navigator.language,
                                { timeStyle: `short` },
                              )}
                            </Text>
                            <Text>{event.type}</Text>
                          </Stack>
                        )
                      })}
                    </Stack>
                  )
                })}
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
