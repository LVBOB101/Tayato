const express = require('express');
const cors = require('cors');
const pool = require('./db');
const employeeRoutes = require('./routes/employeeRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json()); // ใช้ express.json() แทน body-parser
app.use(express.urlencoded({ extended: true })); // สำหรับรับข้อมูลในรูปแบบ URL-encoded

// ใช้ router สำหรับ API ที่เกี่ยวข้องกับการสมัครพนักงานและการเข้าสู่ระบบ
app.use('/api', employeeRoutes);
app.use('/api', vehicleRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  // ทดสอบการเชื่อมต่อฐานข้อมูล
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('Database connection error:', err);
    } else {
      console.log('Database connected:', res.rows[0]);
    }
  });
});