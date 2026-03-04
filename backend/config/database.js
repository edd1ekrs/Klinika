const { createPool } = require('mysql');

const pool = createPool({
    host: "localhost",
    user: "root",
    password: "Oshki2021*",
    database: "polyclinic_db",
    connectionLimit: 10
});

pool.query('select * from polyclinic_db.patients', (err, results) => {
});

