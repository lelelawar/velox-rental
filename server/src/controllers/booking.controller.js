const prisma = require('../config/prisma');
const { bookingSchema } = require('../validators/booking.validator');
const { success, error, paginated } = require('../utils/response');
const { generateBookingCode, calculateDays } = require('../utils/booking');

exports.create = async (req, res, next) => {
  try {
    const data = bookingSchema.parse(req.body);
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) return error(res, 'Kendaraan tidak ditemukan', 404);
    if (vehicle.status !== 'AVAILABLE') return error(res, 'Kendaraan tidak tersedia saat ini', 400);

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    // Check overlapping
    const overlap = await prisma.booking.findFirst({
      where: {
        vehicleId: data.vehicleId,
        status: { in: ['PENDING', 'CONFIRMED', 'ACTIVE'] },
        AND: [{ startDate: { lt: endDate } }, { endDate: { gt: startDate } }]
      }
    });
    if (overlap) return error(res, 'Kendaraan sudah dipesan pada tanggal tersebut', 400);

    const totalDays = calculateDays(startDate, endDate);
    const pricePerDay = parseFloat(vehicle.pricePerDay);
    const subtotal = totalDays * pricePerDay;
    const additionalFee = 0;
    const totalPrice = subtotal + additionalFee;

    const booking = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.create({
        data: {
          bookingCode: generateBookingCode(),
          userId: req.user.id,
          vehicleId: data.vehicleId,
          startDate, endDate, totalDays,
          pricePerDay, subtotal, additionalFee, totalPrice,
          pickupLocation: data.pickupLocation,
          notes: data.notes
        }
      });
      await tx.payment.create({
        data: {
          bookingId: b.id,
          amount: totalPrice,
          method: data.paymentMethod,
          status: 'PENDING'
        }
      });
      return b;
    });

    const full = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: { vehicle: { include: { images: { where: { isPrimary: true }, take: 1 } } }, payment: true }
    });
    return success(res, full, 'Pemesanan berhasil dibuat', 201);
  } catch (err) { next(err); }
};

exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = { userId: req.user.id };
    if (status) where.status = status;
    if (search) where.bookingCode = { contains: search };
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where, skip, take: parseInt(limit),
        include: {
          vehicle: { include: { images: { where: { isPrimary: true }, take: 1 } } },
          payment: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.booking.count({ where })
    ]);
    return paginated(res, bookings, { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        vehicle: { include: { images: true, category: true } },
        user: { select: { id: true, name: true, email: true, phone: true } },
        payment: { include: { proofs: true } }
      }
    });
    if (!booking) return error(res, 'Pemesanan tidak ditemukan', 404);
    if (req.user.role === 'CUSTOMER' && booking.userId !== req.user.id) {
      return error(res, 'Akses ditolak', 403);
    }
    return success(res, booking);
  } catch (err) { next(err); }
};

exports.cancel = async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!booking) return error(res, 'Pemesanan tidak ditemukan', 404);
    if (booking.userId !== req.user.id) return error(res, 'Akses ditolak', 403);
    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      return error(res, 'Pemesanan tidak dapat dibatalkan pada status ini', 400);
    }
    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'CANCELLED' }
    });
    return success(res, updated, 'Pemesanan berhasil dibatalkan');
  } catch (err) { next(err); }
};

exports.adminUpdateStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    const id = parseInt(req.params.id);
    const booking = await prisma.booking.findUnique({ where: { id }, include: { payment: true } });
    if (!booking) return error(res, 'Pemesanan tidak ditemukan', 404);

    const updateData = { status };
    if (status === 'REJECTED') updateData.rejectionReason = rejectionReason;
    if (status === 'ACTIVE') {
      updateData.pickedUpAt = new Date();
      await prisma.vehicle.update({ where: { id: booking.vehicleId }, data: { status: 'RENTED' } });
    }
    if (status === 'COMPLETED') {
      updateData.returnedAt = new Date();
      await prisma.vehicle.update({ where: { id: booking.vehicleId }, data: { status: 'AVAILABLE' } });
    }
    if ((status === 'CANCELLED' || status === 'REJECTED') && booking.vehicle) {
      await prisma.vehicle.update({ where: { id: booking.vehicleId }, data: { status: 'AVAILABLE' } }).catch(() => {});
    }

    const updated = await prisma.booking.update({ where: { id }, data: updateData });
    return success(res, updated, 'Status pemesanan berhasil diperbarui');
  } catch (err) { next(err); }
};
