import { z } from 'zod'

export const userSchema = z.object({
  name: z
    .string()
    .min(3, 'Nama minimal 3 karakter')
    .max(100, 'Nama maksimal 100 karakter'),
  email: z
    .string()
    .email('Format email tidak valid'),
  password: z
    .string()
    .min(6, 'Password minimal 6 karakter')
    .optional(),
  role: z.enum(['super_admin', 'cs_support', 'cs_representative', 'advertiser', 'retention']),
  kodeAdsIds: z.array(z.number()).optional(), // Array of KodeAds IDs for advertiser
})

export type UserInput = z.infer<typeof userSchema>
