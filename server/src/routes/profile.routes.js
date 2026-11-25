const router = require('express').Router();
const ctrl = require('../controllers/profile.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/', ctrl.get);
router.put('/', ctrl.update);
router.put('/password', ctrl.changePassword);

module.exports = router;
