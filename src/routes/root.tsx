import * as React from 'react'
import * as Y from 'yjs'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { createEntry } from '../doc-factory'
import '../App.css'
import { useSelf, useYjsData, useUsers } from '../hooks'
import { Heading, Box, Avatar, IconClose, Stack } from 'degen'
import { groupBy } from 'lodash'
import { Text } from '../components'
import Event from '../components/event'
import { useYjs, useAuth } from '../situated'
// import * as Components from "../styles/base-components"
// import * as styles from "./base-components.css"
import { fontStyles } from '../styles/typography.css'
import * as Components from '../styles/base-components'
import * as rootStyles from '../styles/root.css'
import '../styles/app.css'

function App() {
  // Router info
  const navigate = useNavigate()
  const location = useLocation()

  const { authenticationStatus, accountInfo } = useAuth()

  // YJS data
  const {
    provider,
    provider: { awareness },
    rootDoc,
  } = useYjs()
  const usersOnline = useUsers(awareness, (users) => {
    return users.size
  })
  const profile = useYjsData(rootDoc.getMap(`users`), (users) => {
    return users[accountInfo?.address]
  })
  const events = useYjsData(rootDoc.getMap(`entries`))
  const eventTypes = useYjsData(rootDoc.getMap(`types`))

  // Redirect to login if not logged in.
  React.useEffect(() => {
    if (
      authenticationStatus === `unauthenticated` &&
      location.pathname !== `/login`
    ) {
      navigate(`/login`)
    } else if (authenticationStatus === `authenticated`) {
      awareness.setLocalState({
        ...awareness.getLocalState(),
        online: true,
      })
    }
  }, [authenticationStatus])

  const eventsGroupedByDay = groupBy(Object.values(events), (event) =>
    new Date(event.created_at).toLocaleDateString(),
  )

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
              {profile?.name || accountInfo?.address}
            </Text>
            <Avatar
              address={accountInfo?.address}
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
                <form
                  method="post"
                  onSubmit={(e) => {
                    e.preventDefault()
                    const walletAddress = e.target[0].value
                    const typeId = e.target[1].value
                    createEntry({ rootDoc, walletAddress, typeId })
                  }}
                >
                  <Stack space="2">
                    <h3 className={fontStyles.INTER_MED}>Create event</h3>
                    <input
                      type="hidden"
                      id="wallet"
                      name="wallet"
                      value={accountInfo?.address}
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
                </form>
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
                    <Stack space="2" key={day}>
                      <Text>{day}</Text>
                      {dayEvents.map((event) => {
                        return (
                          <Event
                            key={event.id}
                            event={event}
                            provider={provider}
                            eventsMap={rootDoc.getMap(`entries`)}
                            typesMap={rootDoc.getMap(`types`)}
                            users={rootDoc.get(`users`)}
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
