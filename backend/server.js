const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');
const employeeRoutes = require('./routes/employeeRoutes');
const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json()); // ใช้ express.json() แทน body-parser

// ใช้ router สำหรับ API ที่เกี่ยวข้องกับการสมัครพนักงานและการเข้าสู่ระบบ
app.use('/api', employeeRoutes);

// เชื่อมต่อกับฐานข้อมูล PostgreSQL (ทำเพียงครั้งเดียว)
connectDB().then(() => {
  // Start server หลังจากเชื่อมต่อกับ DB สำเร็จ
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
