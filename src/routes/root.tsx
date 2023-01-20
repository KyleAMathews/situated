import * as React from 'react'
import * as Y from 'yjs'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { createEntry } from '../doc-factory'
import '../App.css'
import { useYjsData, useUsers } from '../hooks'
import { Box, Avatar, Stack } from 'degen'
import { Text } from '../components'
import EventsByDay from '../components/events-by-day'
import { useYjs, useAuth } from '../situated'
import { fontStyles } from '../styles/typography.css'
// import * as Components from '../styles/base-components'
// import * as rootStyles from '../styles/root.css'
import '../styles/app.css'

function App() {
  // Router info
  const navigate = useNavigate()
  const location = useLocation()

  const { authenticationStatus, accountInfo } = useAuth()

  // YJS data
  const {
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
                    <h3 className={fontStyles.SpaceMono_MED}>Create event</h3>
                    <input
                      type="hidden"
                      id="wallet"
                      name="wallet"
                      value={accountInfo?.address}
                    />
                    <select
                      name="typeId"
                      className={fontStyles.SpaceMono_SMALL}
                    >
                      {Object.entries(eventTypes).map(([id, type]) => (
                        <option key={type.name} value={id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                    <button
                      className={fontStyles.SpaceMono_SMALL}
                      type="submit"
                    >
                      Submit
                    </button>
                  </Stack>
                </form>
              </Box>
              <h3 className={fontStyles.SpaceMono_LARGE}>Events</h3>
              <EventsByDay events={events} />
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
