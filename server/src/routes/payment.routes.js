const router = require('express').Router();
const ctrl = require('../controllers/payment.controller');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');
const { uploadPaymentProof } = require('../middleware/upload.middleware');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/:id/proof', uploadPaymentProof, ctrl.uploadProof);
router.patch('/:id/status', requireAdmin, ctrl.updateStatus);

module.exports = router;
