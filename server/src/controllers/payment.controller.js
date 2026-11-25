const prisma = require('../config/prisma');
const { success, error, paginated } = require('../utils/response');

exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (req.user.role === 'CUSTOMER') where.booking = { userId: req.user.id };
    if (status) where.status = status;
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where, skip, take: parseInt(limit),
        include: {
          booking: {
            include: {
              user: { select: { id: true, name: true, email: true } },
              vehicle: { select: { id: true, name: true, brand: true } }
            }
          },
          proofs: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.payment.count({ where })
    ]);
    return paginated(res, payments, { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        booking: { include: { user: { select: { id: true, name: true, email: true, phone: true } }, vehicle: { include: { images: { where: { isPrimary: true }, take: 1 } } } } },
        proofs: true
      }
    });
    if (!payment) return error(res, 'Pembayaran tidak ditemukan', 404);
    if (req.user.role === 'CUSTOMER' && payment.booking.userId !== req.user.id) {
      return error(res, 'Akses ditolak', 403);
    }
    return success(res, payment);
  } catch (err) { next(err); }
};

exports.uploadProof = async (req, res, next) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { booking: true }
    });
    if (!payment) return error(res, 'Pembayaran tidak ditemukan', 404);
    if (payment.booking.userId !== req.user.id) return error(res, 'Akses ditolak', 403);
    if (!req.file) return error(res, 'File bukti pembayaran harus diunggah', 400);
    const proof = await prisma.paymentProof.create({
      data: {
        paymentId: payment.id,
        fileUrl: '/uploads/payments/' + req.file.filename,
        notes: req.body.notes
      }
    });
    return success(res, proof, 'Bukti pembayaran berhasil diunggah', 201);
  } catch (err) { next(err); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const payment = await prisma.payment.findUnique({ where: { id: parseInt(req.params.id) }, include: { booking: true } });
    if (!payment) return error(res, 'Pembayaran tidak ditemukan', 404);
    const updateData = { status, notes };
    if (status === 'PAID') {
      updateData.paidAt = new Date();
      await prisma.booking.update({ where: { id: payment.bookingId }, data: { status: 'CONFIRMED' } });
    }
    if (status === 'REFUNDED') {
      await prisma.booking.update({ where: { id: payment.bookingId }, data: { status: 'CANCELLED' } });
    }
    const updated = await prisma.payment.update({ where: { id: payment.id }, data: updateData });
    return success(res, updated, 'Status pembayaran berhasil diperbarui');
  } catch (err) { next(err); }
};
