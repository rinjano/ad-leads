import { z } from 'zod';

export const produkSchema = z.object({
  nama: z.string().min(3, 'Nama produk minimal 3 karakter').max(100, 'Nama produk maksimal 100 karakter'),
  deskripsi: z.string().optional(),
  layananId: z.number().int('Layanan harus berupa bilangan bulat').positive('Layanan harus valid'),
});

export type ProdukInput = z.infer<typeof produkSchema>;
