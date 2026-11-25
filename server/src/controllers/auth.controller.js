const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { registerSchema, loginSchema } = require('../validators/auth.validator');
const { success, error } = require('../utils/response');

const generateToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

exports.register = async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return error(res, 'Email sudah terdaftar', 400);
    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: { name: data.name, email: data.email, phone: data.phone, password: hashedPassword, role: 'CUSTOMER' },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true }
    });
    const token = generateToken(user.id);
    return success(res, { user, token }, 'Registrasi berhasil', 201);
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user || !user.isActive) return error(res, 'Email atau password salah', 401);
    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) return error(res, 'Email atau password salah', 401);
    const token = generateToken(user.id);
    const { password: _, ...safeUser } = user;
    return success(res, { user: safeUser, token }, 'Login berhasil');
  } catch (err) { next(err); }
};

exports.me = async (req, res, next) => {
  try {
    const { password: _, ...safeUser } = req.user;
    return success(res, safeUser);
  } catch (err) { next(err); }
};

exports.logout = (req, res) => success(res, null, 'Logout berhasil');
