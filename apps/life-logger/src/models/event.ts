import { z } from 'zod'

export const Event = z.object({
  id: z.string(),
  created_at: z.string().datetime(),
  typeId: z.string().datetime(),
  creator: z.string(),
})

// extract the inferred type
export type Event = z.infer<typeof Event>
