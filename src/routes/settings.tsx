import * as React from 'react'
import { Link } from 'react-router-dom'
import { useYjsData } from '../hooks'
import { useYjs, useAuth } from '../situated'
import { nanoid } from 'nanoid'
import { H2, H3 } from '../styles/base-components'
import { fontStyles } from '../styles/typography.css'
import * as styles from '../styles/settings.css'
import { Text } from '../components'
import { Heading, Box, Stack } from 'degen'

function Settings() {
  const {
    rootDoc,
    provider: { awareness },
  } = useYjs()
  const { accountInfo } = useAuth()
  const eventTypes = useYjsData(rootDoc.getMap(`types`))
  const users = rootDoc.getMap(`users`)

  return (
    <Stack>
      <Heading level="2">Settings</Heading>
      <Stack space="12">
        <Stack space="3">
          <h3 className={fontStyles.SpaceMono_LARGE}>Event Types</h3>
          <Box
            className={fontStyles.SpaceMono_MED}
            as="ul"
            paddingLeft="4"
            style={{ listStyle: `disc` }}
          >
            {Array.from(rootDoc.getMap(`types`)).map(([id, type]) => {
              return (
                <li key={type.name}>
                  <Link to={`/type/${id}`}>{type.name}</Link>
                </li>
              )
            })}
          </Box>
          <Box width="64">
            <form
              method="post"
              onSubmit={(e) => {
                e.preventDefault()
                rootDoc.getMap(`types`).set(nanoid(), {
                  name: e.target.name.value,
                  walletAddress: e.target.wallet.value,
                })
              }}
            >
              <Stack space="1">
                <input
                  type="hidden"
                  id="wallet"
                  name="wallet"
                  value={accountInfo.address}
                />
                <input type="text" name="name" />
                <button className={fontStyles.SpaceMono_MED} type="submit">
                  Submit
                </button>
              </Stack>
            </form>
          </Box>
        </Stack>
        <Stack space="4">
          <h3 className={fontStyles.SpaceMono_LARGE}>Profile</h3>
          <Box width="32">
            <form
              method="post"
              onSubmit={(e) => {
                e.preventDefault()
                const profile = {
                  ...awareness.getLocalState(),
                  address: accountInfo.address,
                  name: e.target.name.value,
                  avatar: e.target.avatar.value,
                }
                users.set(accountInfo.address, profile)
                awareness.setLocalState({
                  ...profile,
                  user: { name: profile.name },
                })
              }}
            >
              <Stack space="1">
                <label className={fontStyles.SpaceMono_MED}>Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={users.get(accountInfo.address)?.name}
                />
                <label className={fontStyles.SpaceMono_MED}>Avatar</label>
                <input
                  type="text"
                  name="avatar"
                  defaultValue={users.get(accountInfo.address)?.avatar}
                />
                <button className={fontStyles.SpaceMono_MED} type="submit">
                  Submit
                </button>
              </Stack>
            </form>
          </Box>
        </Stack>
      </Stack>
    </Stack>
  )
}

export default Settings
