import * as React from 'react'
import * as Y from 'yjs'
import Editor from './editor'
import { Text } from '../components'
import { Box, Avatar, IconClose, IconChevronDown, Stack } from 'degen'

function Event({ eventsMap, provider, event, users }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const user = users.get(event.creator)
  return (
    <Box key={event.id}>
      <Box onClick={() => setIsOpen(!isOpen)} cursor="pointer">
        <Stack direction="horizontal" space="2">
          <Avatar address={user?.address} size="3" src={user?.avatar} />
          <Text>
            {new Date(event.created_at).toLocaleTimeString(navigator.language, {
              timeStyle: `short`,
            })}
          </Text>
          <Text>{event.type}</Text>
          {isOpen ? <IconClose size={3} /> : <IconChevronDown size={3} />}
        </Stack>
      </Box>
      {isOpen &&
        eventsMap.get(event.id).get(`body`) instanceof Y.XmlFragment && (
          <Box maxWidth="144">
            <Editor
              provider={provider}
              xmlType={eventsMap.get(event.id).get(`body`)}
            />
          </Box>
        )}
    </Box>
  )
}

export default Event
