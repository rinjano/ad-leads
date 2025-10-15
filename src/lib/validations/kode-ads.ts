import { z } from 'zod'

export const kodeAdsSchema = z.object({
  kode: z
    .string()
    .min(3, 'Kode ads minimal 3 karakter')
    .max(50, 'Kode ads maksimal 50 karakter')
    .regex(/^[A-Z0-9-_]+$/, 'Kode ads hanya boleh mengandung huruf besar, angka, tanda hubung (-) dan underscore (_)'),
  nama: z
    .string()
    .min(3, 'Nama minimal 3 karakter')
    .max(200, 'Nama maksimal 200 karakter'),
  platform: z
    .string()
    .min(1, 'Platform wajib diisi')
    .max(50, 'Platform maksimal 50 karakter')
    .optional()
    .nullable(),
  status: z.enum(['aktif', 'nonaktif']).optional().default('aktif'),
})

export type KodeAdsInput = z.infer<typeof kodeAdsSchema>
