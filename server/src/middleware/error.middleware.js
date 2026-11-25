const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Validasi gagal',
      errors: err.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
    });
  }
  if (err.code === 'P2002') {
    return res.status(400).json({ success: false, message: 'Data sudah ada (duplikat).' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
  }
  const status = err.status || 500;
  res.status(status).json({ success: false, message: err.message || 'Terjadi kesalahan server.' });
};

module.exports = { errorHandler };
