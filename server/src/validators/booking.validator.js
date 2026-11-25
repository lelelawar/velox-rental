const { z } = require('zod');

const bookingSchema = z.object({
  vehicleId: z.coerce.number().positive(),
  startDate: z.string().refine(d => !isNaN(Date.parse(d)), 'Tanggal mulai tidak valid'),
  endDate: z.string().refine(d => !isNaN(Date.parse(d)), 'Tanggal selesai tidak valid'),
  pickupLocation: z.string().min(3, 'Lokasi pengambilan harus diisi'),
  paymentMethod: z.enum(['BANK_TRANSFER', 'E_WALLET', 'CASH']),
  notes: z.string().optional()
}).refine(d => new Date(d.endDate) > new Date(d.startDate), {
  message: 'Tanggal selesai harus setelah tanggal mulai',
  path: ['endDate']
}).refine(d => new Date(d.startDate) >= new Date(new Date().setHours(0,0,0,0)), {
  message: 'Tanggal mulai tidak boleh di masa lalu',
  path: ['startDate']
});

module.exports = { bookingSchema };
