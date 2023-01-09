import * as React from 'react'
import { useAccount } from 'wagmi'
import { useYjsData } from '../hooks'
import { rootDoc, awareness } from '../doc-factory'
import { nanoid } from 'nanoid'
import { H2, H3 } from '../styles/base-components'
import { fontStyles } from '../styles/typography.css'
import * as styles from '../styles/settings.css'
import {
  Text,
  Heading,
  Button,
  Card,
  Box,
  Avatar,
  IconLockClosed,
  Stack,
} from 'degen'

function Settings() {
  const accountInfo = useAccount()
  const users = rootDoc.getMap(`users`)
  const typesMap = rootDoc.getMap(`types`)
  const eventTypes = useYjsData(typesMap)

  return (
    <Stack>
      <Heading level="2">Settings</Heading>
      <Stack space="12">
        <Stack space="2">
          <h3 className={fontStyles.INTER_LARGE}>Types</h3>
          <Box as="ul" paddingLeft="4" style={{ listStyle: `disc` }}>
            {Object.values(eventTypes).map((type) => {
              return <li key={type.name}>{type.name}</li>
            })}
          </Box>
          <Box width="64">
            <form
              method="post"
              onSubmit={(e) => {
                e.preventDefault()
                console.log(e)
                typesMap.set(nanoid(), {
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
                <button type="submit">Submit</button>
              </Stack>
            </form>
          </Box>
        </Stack>
        <Stack space="4">
          <h3 className={fontStyles.INTER_LARGE}>Profile</h3>
          <Box width="32">
            <form
              method="post"
              onSubmit={(e) => {
                e.preventDefault()
                console.log(e)
                const profile = {
                  ...awareness.getLocalState(),
                  name: e.target.name.value,
                  avatar: e.target.avatar.value,
                }
                console.log({ profile })
                users.set(accountInfo.address, profile)
                awareness.setLocalState(profile)
              }}
            >
              <Stack space="1">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={users.get(accountInfo.address)?.name}
                />
                <label>Avatar</label>
                <input
                  type="text"
                  name="avatar"
                  defaultValue={users.get(accountInfo.address)?.avatar}
                />
                <button type="submit">Submit</button>
              </Stack>
            </form>
          </Box>
        </Stack>
      </Stack>
    </Stack>
  )
}

export default Settings
