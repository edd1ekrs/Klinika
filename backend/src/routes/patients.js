const router = require('express').Router();
const { Patient, User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('admin', 'staff', 'doctor'), async (req, res) => {
  try {
    const patients = await Patient.findAll({ include: [{ model: User, as: 'user', attributes: ['email', 'role'] }] });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
