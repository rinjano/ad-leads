import { z } from 'zod'

export const bukanLeadsSchema = z.object({
  nama: z
    .string()
    .min(3, 'Nama kategori minimal 3 karakter')
    .max(100, 'Nama kategori maksimal 100 karakter'),
  deskripsi: z
    .string()
    .max(500, 'Deskripsi maksimal 500 karakter')
    .optional()
    .or(z.literal('')),
})

export type BukanLeadsInput = z.infer<typeof bukanLeadsSchema>
