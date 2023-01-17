import * as React from 'react'
import * as Y from 'yjs'
import Editor from './editor'
import { Text } from '../components'
import { Box, Avatar, IconClose, IconChevronDown, Stack } from 'degen'

function Event({ eventsMap, typesMap, provider, event, users }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const user = users.get(event.creator)

  return (
    <Stack space="2">
      <Box onClick={() => setIsOpen(!isOpen)} cursor="pointer">
        <Stack direction="horizontal" space="2">
          <Avatar address={user?.address} size="3" src={user?.avatar} />
          <Text>
            {new Date(event.created_at).toLocaleTimeString(navigator.language, {
              timeStyle: `short`,
            })}
          </Text>
          <Text>{typesMap.get(event.typeId)?.name}</Text>
          {isOpen ? <IconClose size={3} /> : <IconChevronDown size={3} />}
        </Stack>
      </Box>
      {isOpen &&
        eventsMap.get(event.id).get(`body`) instanceof Y.XmlFragment && (
          <Box maxWidth="180">
            <Editor
              provider={provider}
              xmlType={eventsMap.get(event.id).get(`body`)}
            />
          </Box>
        )}
      {isOpen && (
        <Box
          width="180"
          onClick={() => {
            const result = confirm(
              `Are you sure you want to delete this event? It'll be gone forever.`,
            )
            if (result) {
              eventsMap.delete(event.id)
            }
          }}
        >
          <button>delete</button>
        </Box>
      )}
    </Stack>
  )
}

export default Event
