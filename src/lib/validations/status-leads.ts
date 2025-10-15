import { z } from 'zod'

export const statusLeadsSchema = z.object({
  nama: z
    .string()
    .min(3, 'Nama status minimal 3 karakter')
    .max(100, 'Nama status maksimal 100 karakter'),
})

export type StatusLeadsInput = z.infer<typeof statusLeadsSchema>
