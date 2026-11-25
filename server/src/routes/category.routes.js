const router = require('express').Router();
const ctrl = require('../controllers/category.controller');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');

router.get('/', ctrl.getAll);
router.post('/', authenticate, requireAdmin, ctrl.create);
router.put('/:id', authenticate, requireAdmin, ctrl.update);
router.delete('/:id', authenticate, requireAdmin, ctrl.delete);

module.exports = router;
