import * as React from 'react'
import { useParams } from 'react-router-dom'
import { useYjs, useSubscribeYjs, useAuth } from '../situated'
import { fontStyles } from '../styles/typography.css'
import { Stack } from 'degen'
import { Text } from '../components/text'
import EventsByDay from '../components/events-by-day'

function Type() {
  const { rootDoc } = useYjs()
  const params = useParams()
  const type = rootDoc.getMap(`types`).get(params.id)
  const events = useSubscribeYjs(rootDoc.get(`entries`), (events) => {
    return Object.values(events).filter((event) => event.typeId == params.id)
  })

  return (
    <Stack>
      <h2 className={fontStyles.SpaceMono_XLARGE}>{type.name}</h2>
      <Text>{events.length} events recorded</Text>
      <EventsByDay events={events} showEventName={false} />
    </Stack>
  )
}

export default Type
