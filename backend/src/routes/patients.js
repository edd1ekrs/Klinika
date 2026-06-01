const router = require('express').Router();
const { Patient, User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

const patientInclude = [{ model: User, as: 'user', attributes: ['email', 'role'] }];

const requireBody = (body, fields) => {
  const missing = fields.filter((field) => !body[field]);
  return missing.length ? `Missing required fields: ${missing.join(', ')}` : null;
};

router.get('/', authenticate, authorize('admin', 'doctor'), async (req, res) => {
  try {
    const patients = await Patient.findAll({ include: patientInclude, order: [['created_at', 'DESC']] });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id, { include: patientInclude });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    if (req.user.role === 'patient' && patient.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const validationError = requireBody(req.body, ['first_name', 'last_name', 'email']);
    if (validationError) return res.status(400).json({ error: validationError });

    const exists = await User.findOne({ where: { email: req.body.email } });
    if (exists) return res.status(400).json({ error: 'Email already registered' });

    const user = await User.create({
      email: req.body.email,
      password: req.body.password || 'patient123',
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      phone: req.body.phone,
      role: 'patient',
    });
    const patient = await Patient.create({ ...req.body, user_id: user.id });
    const full = await Patient.findByPk(patient.id, { include: patientInclude });
    res.status(201).json(full);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id, { include: [{ model: User, as: 'user' }] });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    await patient.update(req.body);
    if (patient.user) {
      await patient.user.update({
        email: req.body.email ?? patient.user.email,
        first_name: req.body.first_name ?? patient.user.first_name,
        last_name: req.body.last_name ?? patient.user.last_name,
        phone: req.body.phone ?? patient.user.phone,
      });
    }

    const full = await Patient.findByPk(patient.id, { include: patientInclude });
    res.json(full);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    const userId = patient.user_id;
    await patient.destroy();
    await User.destroy({ where: { id: userId, role: 'patient' } });
    res.json({ message: 'Patient deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
