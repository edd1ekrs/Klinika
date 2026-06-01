const router = require('express').Router();
const { Appointment, Doctor, Patient, Service } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

const includeAll = [
  { model: Doctor, as: 'doctor' },
  { model: Patient, as: 'patient' },
  { model: Service, as: 'service' },
];

const privilegedRoles = ['admin', 'doctor'];

const canManageAppointment = async (req, appointment) => {
  if (privilegedRoles.includes(req.user.role)) return true;
  const patient = await Patient.findOne({ where: { user_id: req.user.id } });
  return !!patient && appointment.patient_id === patient.id;
};

router.get('/', authenticate, authorize('admin', 'doctor'), async (req, res) => {
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

router.put('/:id/cancel', authenticate, async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    const patient = await Patient.findOne({ where: { user_id: req.user.id } });
    if (!patient || appointment.patient_id !== patient.id) {
      return res.status(403).json({ error: 'Patients can only cancel their own appointments' });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({ error: 'Completed appointments cannot be cancelled' });
    }

    await appointment.update({ status: 'cancelled' });
    const full = await Appointment.findByPk(appointment.id, { include: includeAll });
    res.json(full);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    let patientId = req.body.patient_id;
    if (!privilegedRoles.includes(req.user.role)) {
      const patient = await Patient.findOne({ where: { user_id: req.user.id } });
      if (!patient) return res.status(400).json({ error: 'Patient profile not found' });
      patientId = patient.id;
    }
    if (!patientId || !req.body.doctor_id || !req.body.service_id || !req.body.scheduled_at) {
      return res.status(400).json({ error: 'patient_id, doctor_id, service_id and scheduled_at are required' });
    }
    const appointment = await Appointment.create({ ...req.body, patient_id: patientId });
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
    if (!(await canManageAppointment(req, appointment))) return res.status(403).json({ error: 'Forbidden' });
    if (!privilegedRoles.includes(req.user.role)) {
      delete req.body.patient_id;
      delete req.body.status;
    }
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
    if (!(await canManageAppointment(req, appointment))) return res.status(403).json({ error: 'Forbidden' });
    await appointment.destroy();
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
