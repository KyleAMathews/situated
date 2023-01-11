import * as React from 'react'
import * as Y from 'yjs'
import { Outlet, Link, Form, useNavigate, useLocation } from 'react-router-dom'
import '../App.css'
import { useSelf, useYjsData, useUsers } from '../hooks'
import { rootDoc, awareness, provider } from '../doc-factory'
import { useAccount } from 'wagmi'
import { AuthenticationStatus } from '../auth-status'
import { Heading, Box, Avatar, IconClose, Stack } from 'degen'
import { groupBy } from 'lodash'
import { Text } from '../components'
import Event from '../components/event'
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
  const usersOnline = useUsers(awareness, (users) => {
    return users.size
  })
  const profile = useYjsData(users, (users) => {
    return users[accountInfo?.address]
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

  console.log(import.meta.env)
  return (
    <div className="App">
      <Box padding="4">
        <Stack space="6">
          <Stack direction="horizontal" align="center">
            <Text>
              <Link to="/">
                Life Logger v{import.meta.env.VITE_COMMIT_COUNT}
              </Link>
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
            <Text size="extraSmall">{usersOnline} people online</Text>
          </Stack>
          <div
            style={{
              display: location.pathname === `/` ? `block` : `none`,
            }}
          >
            <Stack space="4">
              <Box
                style={{
                  display: location.pathname === `/` ? `block` : `none`,
                }}
                width="64"
              >
                <Form method="post">
                  <Stack space="2">
                    <h3 className={fontStyles.INTER_MED}>Create event</h3>
                    <input
                      type="hidden"
                      id="wallet"
                      name="wallet"
                      value={accountInfo.address}
                    />
                    <select name="typeId" className={fontStyles.INTER_SMALL}>
                      {Object.entries(eventTypes).map(([id, type]) => (
                        <option key={type.name} value={id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                    <button className={fontStyles.INTER_SMALL} type="submit">
                      Submit
                    </button>
                  </Stack>
                </Form>
              </Box>
              <h3 className={fontStyles.INTER_LARGE}>Events</h3>
              {Object.keys(eventsGroupedByDay)
                .sort((a, b) => (new Date(a) < new Date(b) ? 1 : -1))
                .map((day) => {
                  const dayEvents = eventsGroupedByDay[day]
                  dayEvents.sort((a, b) =>
                    a.created_at < b.created_at ? 1 : -1,
                  )
                  return (
                    <Stack space="2">
                      <Text>{day}</Text>
                      {dayEvents.map((event) => {
                        return (
                          <Event
                            key={event.id}
                            event={event}
                            provider={provider}
                            eventsMap={eventsMap}
                            typesMap={typesMap}
                            users={users}
                          />
                        )
                      })}
                    </Stack>
                  )
                })}
            </Stack>
          </div>
          <React.Suspense>
            <Outlet />
          </React.Suspense>
        </Stack>
      </Box>
    </div>
  )
}

export default App
