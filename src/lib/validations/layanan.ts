import { z } from 'zod'

export const layananSchema = z.object({
  nama: z.string().min(3, 'Nama layanan minimal 3 karakter').max(100, 'Nama layanan maksimal 100 karakter'),
})

export type LayananInput = z.infer<typeof layananSchema>
