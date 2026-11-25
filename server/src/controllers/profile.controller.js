const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { success, error } = require('../utils/response');

exports.get = async (req, res) => {
  const { password: _, ...safeUser } = req.user;
  return success(res, safeUser);
};

exports.update = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, phone, address },
      select: { id: true, name: true, email: true, phone: true, address: true, avatar: true, role: true }
    });
    return success(res, user, 'Profil berhasil diperbarui');
  } catch (err) { next(err); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword) return error(res, 'Semua field harus diisi', 400);
    if (newPassword !== confirmPassword) return error(res, 'Konfirmasi password tidak cocok', 400);
    if (newPassword.length < 6) return error(res, 'Password baru minimal 6 karakter', 400);
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) return error(res, 'Password saat ini salah', 400);
    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
    return success(res, null, 'Password berhasil diubah');
  } catch (err) { next(err); }
};
