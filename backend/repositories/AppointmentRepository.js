const { Appointment, Patient, Doctor, Service } = require('../models');

class AppointmentRepository {
  async findAll({ page = 1, limit = 10, status, doctorId, patientId }) {
    const where = {};
    if (status) where.status = status;
    if (doctorId) where.doctorId = doctorId;
    if (patientId) where.patientId = patientId;
    return Appointment.findAndCountAll({
      where, include: [
        { model: Patient, attributes: ['id','firstName','lastName'] },
        { model: Doctor, attributes: ['id','firstName','lastName','specialization'] },
        { model: Service, attributes: ['id','name','price'] }
      ], limit, offset: (page - 1) * limit, order: [['scheduledAt', 'DESC']]
    });
  }
  async findById(id) {
    return Appointment.findByPk(id, { include: [Patient, Doctor, Service] });
  }
  async create(data) { return Appointment.create(data); }
  async update(id, data) { await Appointment.update(data, { where: { id } }); return this.findById(id); }
  async delete(id) { return Appointment.destroy({ where: { id } }); }
}

module.exports = new AppointmentRepository();
