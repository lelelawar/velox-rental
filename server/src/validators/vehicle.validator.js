const { z } = require('zod');

const vehicleSchema = z.object({
  name: z.string().min(2, 'Nama kendaraan minimal 2 karakter'),
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.coerce.number().min(1990).max(new Date().getFullYear() + 1),
  color: z.string().min(1),
  licensePlate: z.string().min(4).max(20),
  description: z.string().optional(),
  pricePerDay: z.coerce.number().positive('Harga harus lebih dari 0'),
  transmission: z.enum(['MANUAL', 'AUTOMATIC', 'CVT']),
  fuelType: z.enum(['BENSIN', 'DIESEL', 'LISTRIK', 'HYBRID']),
  capacity: z.coerce.number().min(1).max(50),
  status: z.enum(['AVAILABLE', 'RENTED', 'MAINTENANCE', 'INACTIVE']).optional(),
  location: z.string().min(3),
  features: z.string().optional(),
  categoryId: z.coerce.number().positive()
});

module.exports = { vehicleSchema };
