const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createStorage = (folder) => {
  const uploadPath = path.join(__dirname, '../../uploads', folder);
  if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, unique + path.extname(file.originalname));
    }
  });
};

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new Error('Hanya file gambar (jpg, png, webp) yang diizinkan'));
};

const uploadVehicleImages = multer({
  storage: createStorage('vehicles'),
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 }
}).array('images', 5);

const uploadPaymentProof = multer({
  storage: createStorage('payments'),
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 }
}).single('proof');

module.exports = { uploadVehicleImages, uploadPaymentProof };
