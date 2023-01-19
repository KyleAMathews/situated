import * as React from 'react'
import { useParams } from 'react-router-dom'
import { useYjsData } from '../hooks'
import { useYjs, useAuth } from '../situated'
import { fontStyles } from '../styles/typography.css'
import { Stack } from 'degen'
import EventsByDay from '../components/events-by-day'

function Type() {
  const { rootDoc } = useYjs()
  const params = useParams()
  const type = rootDoc.getMap(`types`).get(params.id)
  const events = useYjsData(rootDoc.get(`entries`), (events) => {
    return Object.values(events).filter((event) => event.typeId == params.id)
  })

  return (
    <Stack>
      <h2 className={fontStyles.SpaceMono_XLARGE}>{type.name}</h2>
      <EventsByDay events={events} />
    </Stack>
  )
}

export default Type
