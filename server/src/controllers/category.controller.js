const prisma = require('../config/prisma');
const { success, error } = require('../utils/response');

exports.getAll = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { vehicles: true } } },
      orderBy: { name: 'asc' }
    });
    return success(res, categories);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, description, icon } = req.body;
    if (!name) return error(res, 'Nama kategori harus diisi', 400);
    const cat = await prisma.category.create({ data: { name, description, icon } });
    return success(res, cat, 'Kategori berhasil ditambahkan', 201);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { name, description, icon } = req.body;
    const cat = await prisma.category.update({
      where: { id: parseInt(req.params.id) },
      data: { name, description, icon }
    });
    return success(res, cat, 'Kategori berhasil diperbarui');
  } catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
  try {
    const count = await prisma.vehicle.count({ where: { categoryId: parseInt(req.params.id) } });
    if (count > 0) return error(res, 'Kategori tidak dapat dihapus karena masih memiliki kendaraan', 400);
    await prisma.category.delete({ where: { id: parseInt(req.params.id) } });
    return success(res, null, 'Kategori berhasil dihapus');
  } catch (err) { next(err); }
};
