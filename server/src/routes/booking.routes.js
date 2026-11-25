const router = require('express').Router();
const ctrl = require('../controllers/booking.controller');
const adminCtrl = require('../controllers/admin.controller');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.get('/:id', ctrl.getById);
router.patch('/:id/cancel', ctrl.cancel);
router.patch('/:id/status', requireAdmin, ctrl.adminUpdateStatus);

module.exports = router;
