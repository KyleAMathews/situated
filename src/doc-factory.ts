import * as Y from 'yjs'
import { nanoid } from 'nanoid'

export function createEntry({
  walletAddress,
  typeId,
  rootDoc,
}: {
  walletAddress: string
  typeId: string
}) {
  const entry = new Y.Map()
  const id = nanoid()
  const entries = rootDoc.getMap(`entries`)
  rootDoc.transact(() => {
    entry.set(`id`, id)
    entry.set(`created_at`, new Date().toJSON())
    entry.set(`typeId`, typeId)
    entry.set(`body`, new Y.XmlFragment())
    entry.set(`creator`, walletAddress)
    entries.set(id, entry)
  })
  console.log(entry.toJSON())
  return entry
}
