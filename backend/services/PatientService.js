const patientRepo = require('../repositories/PatientRepository');

class PatientService {
  async getAll(query) { return patientRepo.findAll(query); }
  async getById(id) {
    const patient = await patientRepo.findById(id);
    if (!patient) throw { status: 404, message: 'Patient not found' };
    return patient;
  }
  async create(data) { return patientRepo.create(data); }
  async update(id, data) { await this.getById(id); return patientRepo.update(id, data); }
  async delete(id) { await this.getById(id); return patientRepo.delete(id); }
}

module.exports = new PatientService();
