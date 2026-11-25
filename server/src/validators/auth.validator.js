const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter').max(100),
  email: z.string().email('Format email tidak valid'),
  phone: z.string().min(10, 'Nomor telepon minimal 10 digit').max(20),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  confirmPassword: z.string()
}).refine(d => d.password === d.confirmPassword, { message: 'Konfirmasi password tidak cocok', path: ['confirmPassword'] });

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password harus diisi')
});

module.exports = { registerSchema, loginSchema };
