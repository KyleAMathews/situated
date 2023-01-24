import { z } from 'zod'

export const EventType = z.object({
  name: z.string(),
  walletAddress: z.string(),
})

// extract the inferred type
export type EventType = z.infer<typeof EventType>
