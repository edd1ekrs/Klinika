const router = require('express').Router();
const { Op } = require('sequelize');
const { Appointment, Doctor, Patient, Service } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

const includeAll = [
  { model: Doctor, as: 'doctor' },
  { model: Patient, as: 'patient' },
  { model: Service, as: 'service' },
];

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const startOfWeek = (date) => {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
};

const endOfWeek = (date) => {
  const d = startOfWeek(date);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
};

const activeAppointmentWhere = (start, end) => ({
  scheduled_at: { [Op.between]: [start, end] },
  status: { [Op.notIn]: ['cancelled', 'no-show'] },
});

router.get('/stats', authenticate, authorize('admin', 'doctor'), async (_req, res) => {
  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);

    const [
      totalPatients,
      activeDoctors,
      todayAppointments,
      weeklyAppointments,
      appointments,
      recentAppointments,
    ] = await Promise.all([
      Patient.count(),
      Doctor.count({ where: { is_active: true } }),
      Appointment.count({ where: activeAppointmentWhere(todayStart, todayEnd) }),
      Appointment.count({ where: activeAppointmentWhere(weekStart, weekEnd) }),
      Appointment.findAll({ include: includeAll }),
      Appointment.findAll({ include: includeAll, order: [['scheduled_at', 'DESC']], limit: 6 }),
    ]);

    const statusCounts = appointments.reduce((acc, appointment) => {
      acc[appointment.status] = (acc[appointment.status] || 0) + 1;
      return acc;
    }, {});

    const doctorCounts = appointments.reduce((acc, appointment) => {
      if (!appointment.doctor) return acc;
      const id = appointment.doctor.id;
      if (!acc[id]) acc[id] = { doctor: appointment.doctor, appointmentCount: 0, revenue: 0 };
      acc[id].appointmentCount += 1;
      acc[id].revenue += Number(appointment.service?.price ?? 0);
      return acc;
    }, {});

    res.json({
      totalPatients,
      totalDoctors: activeDoctors,
      todayAppointments,
      weeklyAppointments,
      appointmentsByStatus: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
      recentAppointments,
      topDoctors: Object.values(doctorCounts)
        .sort((a, b) => b.appointmentCount - a.appointmentCount)
        .slice(0, 5),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
