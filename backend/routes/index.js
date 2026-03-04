const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const authCtrl = require('../controllers/AuthController');
const patientCtrl = require('../controllers/PatientController');
// Import other controllers the same way...

// Auth
router.post('/auth/login', (req, res) => authCtrl.login(req, res));
router.post('/auth/refresh', (req, res) => authCtrl.refresh(req, res));
router.post('/auth/logout', authenticate, (req, res) => authCtrl.logout(req, res));

// Patients (all authenticated)
router.get('/patients', authenticate, (req, res) => patientCtrl.getAll(req, res));
router.get('/patients/:id', authenticate, (req, res) => patientCtrl.getById(req, res));
router.post('/patients', authenticate, (req, res) => patientCtrl.create(req, res));
router.put('/patients/:id', authenticate, (req, res) => patientCtrl.update(req, res));
router.delete('/patients/:id', authenticate, authorize('admin'), (req, res) => patientCtrl.delete(req, res));

// Repeat same CRUD pattern for: /doctors, /services, /appointments, /payments, /medical-records

module.exports = router;
