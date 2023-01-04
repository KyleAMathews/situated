import { createEntry } from "../doc-factory"
export async function action() {
  const entry = createEntry()
  return { entry }
}
