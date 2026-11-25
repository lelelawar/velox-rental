const router = require('express').Router();
const ctrl = require('../controllers/vehicle.controller');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');
const { uploadVehicleImages } = require('../middleware/upload.middleware');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', authenticate, requireAdmin, uploadVehicleImages, ctrl.create);
router.put('/:id', authenticate, requireAdmin, uploadVehicleImages, ctrl.update);
router.delete('/:id', authenticate, requireAdmin, ctrl.delete);
router.delete('/:id/images/:imageId', authenticate, requireAdmin, ctrl.deleteImage);

module.exports = router;
