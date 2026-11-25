const router = require('express').Router();
const ctrl = require('../controllers/admin.controller');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');

router.use(authenticate, requireAdmin);
router.get('/dashboard', ctrl.dashboard);
router.get('/reports', ctrl.getReports);
router.get('/customers', ctrl.getCustomers);
router.get('/customers/:id', ctrl.getCustomerDetail);
router.patch('/customers/:id/toggle', ctrl.toggleCustomerStatus);
router.get('/bookings', ctrl.getAllBookings);

module.exports = router;
