import { createEntry } from '../doc-factory'
export async function action({ request }) {
  const formData = await request.formData()
  const entry = createEntry({
    walletAddress: formData.get(`wallet`),
    typeId: formData.get(`typeId`),
  })
  return { entry }
}
