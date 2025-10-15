import { z } from 'zod'

// Login validation schema
export const loginSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
})

// Register validation schema
export const registerSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  companyId: z.number().optional(),
  role: z.enum(['admin', 'user', 'cs_representative', 'advertiser', 'cs_support', 'retention_specialist']).optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
