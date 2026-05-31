require('dotenv').config();
const { sequelize, User, Doctor, Service } = require('../models');

const seed = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    await User.findOrCreate({
      where: { email: 'admin@polyclinic.com' },
      defaults: { password: 'admin123', first_name: 'Admin', last_name: 'User', role: 'admin' },
    });
    console.log('✅ Admin: admin@polyclinic.com / admin123');

    const doctors = [
      { first_name: 'Ahmed', last_name: 'Hassan', specialization: 'General Medicine', email: 'ahmed@clinic.com' },
      { first_name: 'Sara', last_name: 'Ali', specialization: 'Pediatrics', email: 'sara@clinic.com' },
      { first_name: 'Omar', last_name: 'Khalil', specialization: 'Dermatology', email: 'omar@clinic.com' },
      { first_name: 'Fatima', last_name: 'Nour', specialization: 'Cardiology', email: 'fatima@clinic.com' },
    ];
    for (const d of doctors) await Doctor.findOrCreate({ where: { email: d.email }, defaults: d });
    console.log('✅ Doctors seeded');

    const services = [
      { name: 'General Consultation', description: 'Standard doctor visit', price: 50, duration_minutes: 30 },
      { name: 'Dental Checkup', description: 'Routine dental examination', price: 75, duration_minutes: 45 },
      { name: 'Eye Examination', description: 'Complete eye checkup', price: 60, duration_minutes: 30 },
      { name: 'Blood Test', description: 'Complete blood count', price: 40, duration_minutes: 15 },
      { name: 'X-Ray', description: 'Digital X-ray imaging', price: 100, duration_minutes: 20 },
    ];
    for (const s of services) await Service.findOrCreate({ where: { name: s.name }, defaults: s });
    console.log('✅ Services seeded');

    console.log('\n🎉 Done!');
    process.exit(0);
  } catch (err) {
    console.error('❌', err.message);
    process.exit(1);
  }
};

seed();
