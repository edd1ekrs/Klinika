const { Patient } = require('../models');

class PatientRepository {
  async findAll({ page = 1, limit = 10, search }) {
    const where = {};
    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    return Patient.findAndCountAll({ where, limit, offset: (page - 1) * limit, order: [['createdAt', 'DESC']] });
  }
  async findById(id) { return Patient.findByPk(id); }
  async create(data) { return Patient.create(data); }
  async update(id, data) { await Patient.update(data, { where: { id } }); return this.findById(id); }
  async delete(id) { return Patient.destroy({ where: { id } }); }
}

module.exports = new PatientRepository();
