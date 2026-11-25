const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token tidak ditemukan' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Akun tidak valid atau dinonaktifkan' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token tidak valid atau sudah expired' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya admin yang diizinkan.' });
  }
  next();
};

const requireCustomer = (req, res, next) => {
  if (req.user.role !== 'CUSTOMER') {
    return res.status(403).json({ success: false, message: 'Akses ditolak.' });
  }
  next();
};

module.exports = { authenticate, requireAdmin, requireCustomer };
