const router = require('express').Router();
const { Appointment, Doctor, Patient, Service } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

const includeAll = [
  { model: Doctor, as: 'doctor' },
  { model: Patient, as: 'patient' },
  { model: Service, as: 'service' },
];

router.get('/', authenticate, authorize('admin', 'staff', 'doctor'), async (req, res) => {
  try {
    const appointments = await Appointment.findAll({ include: includeAll, order: [['scheduled_at', 'DESC']] });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/my', authenticate, async (req, res) => {
  try {
    const patient = await Patient.findOne({ where: { user_id: req.user.id } });
    if (!patient) return res.json([]);
    const appointments = await Appointment.findAll({
      where: { patient_id: patient.id },
      include: includeAll,
      order: [['scheduled_at', 'DESC']],
    });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const patient = await Patient.findOne({ where: { user_id: req.user.id } });
    if (!patient) return res.status(400).json({ error: 'Patient profile not found' });
    const appointment = await Appointment.create({ ...req.body, patient_id: patient.id });
    const full = await Appointment.findByPk(appointment.id, { include: includeAll });
    res.status(201).json(full);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    await appointment.update(req.body);
    const full = await Appointment.findByPk(appointment.id, { include: includeAll });
    res.json(full);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    await appointment.destroy();
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
