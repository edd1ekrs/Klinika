const patientService = require('../services/PatientService');

class PatientController {
  async getAll(req, res) {
    try {
      const { page, limit, search } = req.query;
      const result = await patientService.getAll({ page: +page || 1, limit: +limit || 10, search });
      res.json({ data: result.rows, total: result.count, page: +page || 1 });
    } catch (err) { res.status(500).json({ message: err.message }); }
  }
  async getById(req, res) {
    try { res.json(await patientService.getById(req.params.id)); }
    catch (err) { res.status(err.status || 500).json({ message: err.message }); }
  }
  async create(req, res) {
    try { res.status(201).json(await patientService.create(req.body)); }
    catch (err) { res.status(500).json({ message: err.message }); }
  }
  async update(req, res) {
    try { res.json(await patientService.update(req.params.id, req.body)); }
    catch (err) { res.status(err.status || 500).json({ message: err.message }); }
  }
  async delete(req, res) {
    try { await patientService.delete(req.params.id); res.json({ message: 'Deleted' }); }
    catch (err) { res.status(err.status || 500).json({ message: err.message }); }
  }
}

module.exports = new PatientController();
