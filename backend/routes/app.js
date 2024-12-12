const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt'); // เพิ่ม bcrypt เพื่อเข้ารหัสรหัสผ่าน
const router = express.Router();

// สร้างการเชื่อมต่อกับ PostgreSQL
const pool = new Pool({
  user: 'myuser',
  host: 'localhost',
  database: 'mydatabase',
  password: 'mypassword',
  port: 5432,
});

// API สำหรับสมัครสมาชิก
router.post('/register', async (req, res) => {
    const { name, address, driver_license, phone, email, password } = req.body;
  
    // ตรวจสอบว่ามีข้อมูลครบหรือไม่
    if (!name || !address || !driver_license || !phone || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
  
    try {
      // ตรวจสอบว่า Email ซ้ำหรือไม่
      const emailCheck = await pool.query('SELECT * FROM Customer WHERE Email = $1', [email]);
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ message: 'Email already in use' });
      }
  
      // เข้ารหัสรหัสผ่าน (Hash Password)
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // บันทึกข้อมูลลงฐานข้อมูล
      const result = await pool.query(
        `INSERT INTO Customer (Name, Address, Driver_License, Phone, Email, Password) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [name, address, driver_license, phone, email, hashedPassword]
      );
  
      res.status(201).json({
        message: 'Registration successful!',
        customer: { id: result.rows[0].customerid, name: result.rows[0].name, email: result.rows[0].email },
      });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ message: 'Error during registration' });
    }
  });

  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    // ตรวจสอบว่ามีข้อมูลครบหรือไม่
    if (!email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
  
    try {
      // ค้นหา Email ในฐานข้อมูล
      const userResult = await pool.query('SELECT * FROM Customer WHERE Email = $1', [email]);
  
      if (userResult.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
  
      const user = userResult.rows[0];
  
      // ตรวจสอบรหัสผ่าน
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
  
      res.status(200).json({ message: 'Login successful', customer: { id: user.customerid, name: user.name, email: user.email } });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ message: 'Error during login' });
    }
  });

module.exports = router;
