import { z } from 'zod'

export const tipeFaskesSchema = z.object({
  nama: z
    .string()
    .min(3, 'Nama tipe faskes minimal 3 karakter')
    .max(100, 'Nama tipe faskes maksimal 100 karakter'),
  deskripsi: z
    .string()
    .max(500, 'Deskripsi maksimal 500 karakter')
    .optional()
    .nullable(),
})

export type TipeFaskesInput = z.infer<typeof tipeFaskesSchema>
