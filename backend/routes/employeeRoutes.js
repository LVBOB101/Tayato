const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const router = express.Router();

// การตั้งค่าการเชื่อมต่อ PostgreSQL
const pool = new Pool({
  user: 'myuser',
  host: 'localhost',
  database: 'mydatabase',
  password: 'mypassword',
  port: 5432,
});

// **สมัครพนักงาน**
router.post('/employee/register', async (req, res) => {
  const { name, position, phone, email, password } = req.body;

  // ตรวจสอบข้อมูลที่จำเป็น
  if (!name || !position || !phone || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // ตรวจสอบว่า Email ซ้ำหรือไม่
    const emailCheck = await pool.query('SELECT * FROM Employee WHERE Email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // เข้ารหัสรหัสผ่าน (Hash Password)
    const hashedPassword = await bcrypt.hash(password, 10);

    // บันทึกข้อมูลลงฐานข้อมูล
    const result = await pool.query(
      `INSERT INTO Employee (Name, Position, Phone, Email, Password)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, position, phone, email, hashedPassword]
    );

    // ส่งคำตอบกลับพร้อมข้อมูล
    const newEmployee = result.rows[0];
    res.status(201).json({
      message: 'Employee registered successfully!',
      employee: {
        id: newEmployee.employeeid,
        name: newEmployee.name,
        position: newEmployee.position,
        email: newEmployee.email,
      },
    });
  } catch (err) {
    console.error('Error during employee registration:', err);
    res.status(500).json({ message: 'Error during registration' });
  }
});

// **เข้าสู่ระบบพนักงาน**
router.post('/employee/login', async (req, res) => {
  const { email, password } = req.body;

  // ตรวจสอบข้อมูลที่จำเป็น
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // ค้นหา Email ในฐานข้อมูล
    const userResult = await pool.query('SELECT * FROM Employee WHERE Email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = userResult.rows[0];

    // ตรวจสอบรหัสผ่าน
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // สร้าง JWT Token
    const token = jwt.sign(
      { id: user.employeeid, name: user.name, position: user.position },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '30d' }
    );

    res.status(200).json({
      message: 'Employee login successful',
      token,
      employee: {
        id: user.employeeid,
        name: user.name,
        position: user.position,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Error during employee login:', err);
    res.status(500).json({ message: 'Error during login' });
  }
});

module.exports = router;
