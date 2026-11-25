const prisma = require('../config/prisma');
const { success, error, paginated } = require('../utils/response');

exports.dashboard = async (req, res, next) => {
  try {
    const [
      totalVehicles, totalCustomers, totalBookings, activeRentals,
      pendingBookings, paidPayments, recentBookings, recentCustomers
    ] = await Promise.all([
      prisma.vehicle.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'ACTIVE' } }),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          vehicle: { select: { id: true, name: true, brand: true } },
          payment: { select: { status: true, method: true } }
        }
      }),
      prisma.user.findMany({
        where: { role: 'CUSTOMER' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, phone: true, createdAt: true, isActive: true }
      })
    ]);

    // Monthly revenue (last 6 months)
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const rev = await prisma.payment.aggregate({
        where: { status: 'PAID', paidAt: { gte: start, lte: end } },
        _sum: { amount: true }
      });
      monthlyRevenue.push({
        month: start.toLocaleString('id-ID', { month: 'short', year: 'numeric' }),
        revenue: parseFloat(rev._sum.amount || 0)
      });
    }

    return success(res, {
      stats: {
        totalVehicles,
        totalCustomers,
        totalBookings,
        activeRentals,
        pendingBookings,
        totalRevenue: parseFloat(paidPayments._sum.amount || 0)
      },
      monthlyRevenue,
      recentBookings,
      recentCustomers
    });
  } catch (err) { next(err); }
};

exports.getCustomers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = { role: 'CUSTOMER' };
    if (search) where.OR = [{ name: { contains: search } }, { email: { contains: search } }];
    if (isActive !== undefined) where.isActive = isActive === 'true';
    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take: parseInt(limit),
        select: { id: true, name: true, email: true, phone: true, isActive: true, createdAt: true, _count: { select: { bookings: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);
    return paginated(res, customers, { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) { next(err); }
};

exports.getCustomerDetail = async (req, res, next) => {
  try {
    const customer = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true, name: true, email: true, phone: true, address: true,
        isActive: true, createdAt: true,
        bookings: {
          include: { vehicle: { select: { name: true, brand: true } }, payment: true },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });
    if (!customer || customer.role === 'ADMIN') return error(res, 'Customer tidak ditemukan', 404);
    return success(res, customer);
  } catch (err) { next(err); }
};

exports.toggleCustomerStatus = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!user || user.role !== 'CUSTOMER') return error(res, 'Customer tidak ditemukan', 404);
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { isActive: !user.isActive },
      select: { id: true, name: true, email: true, isActive: true }
    });
    return success(res, updated, `Akun berhasil ${updated.isActive ? 'diaktifkan' : 'dinonaktifkan'}`);
  } catch (err) { next(err); }
};

exports.getReports = async (req, res, next) => {
  try {
    const { startDate, endDate, type = 'revenue' } = req.query;
    const where = {};
    if (startDate && endDate) {
      where.createdAt = { gte: new Date(startDate), lte: new Date(endDate) };
    }

    const [bookingStats, vehicleStats, paymentStats] = await Promise.all([
      prisma.booking.groupBy({
        by: ['status'],
        _count: { id: true },
        where
      }),
      prisma.vehicle.findMany({
        select: {
          id: true, name: true, brand: true,
          _count: { select: { bookings: true } }
        },
        orderBy: { bookings: { _count: 'desc' } },
        take: 10
      }),
      prisma.payment.aggregate({
        where: { status: 'PAID', ...where },
        _sum: { amount: true },
        _count: { id: true }
      })
    ]);

    return success(res, { bookingStats, vehicleStats, paymentStats });
  } catch (err) { next(err); }
};

exports.getAllBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (status) where.status = status;
    if (search) where.OR = [
      { bookingCode: { contains: search } },
      { user: { name: { contains: search } } }
    ];
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where, skip, take: parseInt(limit),
        include: {
          user: { select: { id: true, name: true, email: true } },
          vehicle: { select: { id: true, name: true, brand: true } },
          payment: { select: { id: true, status: true, method: true, amount: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.booking.count({ where })
    ]);
    return paginated(res, bookings, { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) { next(err); }
};
