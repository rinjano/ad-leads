import { z } from 'zod'

export const sumberLeadsSchema = z.object({
  nama: z
    .string()
    .min(3, 'Nama sumber leads minimal 3 karakter')
    .max(100, 'Nama sumber leads maksimal 100 karakter'),
  deskripsi: z
    .string()
    .max(500, 'Deskripsi maksimal 500 karakter')
    .optional()
    .nullable(),
})

export type SumberLeadsInput = z.infer<typeof sumberLeadsSchema>
