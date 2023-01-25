import { z } from 'zod'

export const User = z.object({
  address: z.string(),
  name: z.string(),
  online: z.boolean(),
  avatar: z.string().optional(),
})

// console.log(User.parse({ id: `abc`, name: `Ludwig` }))

// extract the inferred type
export type User = z.infer<typeof User>
