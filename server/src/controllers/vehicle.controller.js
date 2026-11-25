const prisma = require('../config/prisma');
const { vehicleSchema } = require('../validators/vehicle.validator');
const { success, error, paginated } = require('../utils/response');
const path = require('path');

exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, search, categoryId, status, transmission, minPrice, maxPrice, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (search) where.name = { contains: search };
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (status) where.status = status;
    if (transmission) where.transmission = transmission;
    if (minPrice || maxPrice) {
      where.pricePerDay = {};
      if (minPrice) where.pricePerDay.gte = parseFloat(minPrice);
      if (maxPrice) where.pricePerDay.lte = parseFloat(maxPrice);
    }
    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where, skip, take: parseInt(limit),
        include: {
          category: { select: { id: true, name: true } },
          images: { where: { isPrimary: true }, take: 1 },
          _count: { select: { reviews: true } }
        },
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.vehicle.count({ where })
    ]);
    return paginated(res, vehicles, { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        category: true,
        images: true,
        reviews: { include: { user: { select: { id: true, name: true, avatar: true } } }, orderBy: { createdAt: 'desc' } },
        _count: { select: { reviews: true, bookings: true } }
      }
    });
    if (!vehicle) return error(res, 'Kendaraan tidak ditemukan', 404);
    return success(res, vehicle);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const data = vehicleSchema.parse(req.body);
    const vehicle = await prisma.vehicle.create({
      data: {
        ...data,
        pricePerDay: parseFloat(data.pricePerDay),
        categoryId: parseInt(data.categoryId),
        capacity: parseInt(data.capacity),
        year: parseInt(data.year),
      }
    });
    if (req.files && req.files.length > 0) {
      await prisma.vehicleImage.createMany({
        data: req.files.map((f, i) => ({
          vehicleId: vehicle.id,
          url: '/uploads/vehicles/' + f.filename,
          isPrimary: i === 0
        }))
      });
    }
    const full = await prisma.vehicle.findUnique({ where: { id: vehicle.id }, include: { images: true, category: true } });
    return success(res, full, 'Kendaraan berhasil ditambahkan', 201);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await prisma.vehicle.findUnique({ where: { id } });
    if (!existing) return error(res, 'Kendaraan tidak ditemukan', 404);
    const data = vehicleSchema.partial().parse(req.body);
    if (data.pricePerDay) data.pricePerDay = parseFloat(data.pricePerDay);
    if (data.categoryId) data.categoryId = parseInt(data.categoryId);
    if (data.capacity) data.capacity = parseInt(data.capacity);
    if (data.year) data.year = parseInt(data.year);
    const vehicle = await prisma.vehicle.update({ where: { id }, data, include: { images: true, category: true } });
    if (req.files && req.files.length > 0) {
      await prisma.vehicleImage.createMany({
        data: req.files.map((f, i) => ({
          vehicleId: vehicle.id,
          url: '/uploads/vehicles/' + f.filename,
          isPrimary: false
        }))
      });
    }
    return success(res, vehicle, 'Kendaraan berhasil diperbarui');
  } catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const activeBookings = await prisma.booking.count({
      where: { vehicleId: id, status: { in: ['PENDING', 'CONFIRMED', 'ACTIVE'] } }
    });
    if (activeBookings > 0) return error(res, 'Kendaraan tidak dapat dihapus karena memiliki pemesanan aktif', 400);
    await prisma.vehicle.delete({ where: { id } });
    return success(res, null, 'Kendaraan berhasil dihapus');
  } catch (err) { next(err); }
};

exports.deleteImage = async (req, res, next) => {
  try {
    await prisma.vehicleImage.delete({ where: { id: parseInt(req.params.imageId) } });
    return success(res, null, 'Gambar berhasil dihapus');
  } catch (err) { next(err); }
};
