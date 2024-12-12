// models/Employee.js
const bcrypt = require('bcryptjs');
const client = require('../db');

// ฟังก์ชันสำหรับสมัครพนักงาน
const registerEmployee = async (name, email, password, position) => {
  // ตรวจสอบว่าอีเมลนี้มีอยู่แล้วหรือไม่
  const checkEmailQuery = 'SELECT * FROM employees WHERE email = $1';
  const emailRes = await client.query(checkEmailQuery, [email]);
  if (emailRes.rows.length > 0) {
    throw new Error('Employee already exists');
  }

  // แฮชรหัสผ่านก่อนบันทึก
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // สร้างคำสั่ง SQL สำหรับเพิ่มข้อมูลพนักงานใหม่
  const insertQuery = `
    INSERT INTO employees (name, email, password, position)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, position
  `;
  const result = await client.query(insertQuery, [name, email, hashedPassword, position]);

  return result.rows[0]; // คืนค่าข้อมูลพนักงานที่ถูกเพิ่ม
};

// ฟังก์ชันสำหรับการเข้าสู่ระบบ
const loginEmployee = async (email, password) => {
  // ค้นหาข้อมูลพนักงานจากอีเมล
  const query = 'SELECT * FROM employees WHERE email = $1';
  const result = await client.query(query, [email]);

  if (result.rows.length === 0) {
    throw new Error('Invalid email or password');
  }

  const employee = result.rows[0];

  // ตรวจสอบรหัสผ่าน
  const isMatch = await bcrypt.compare(password, employee.password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  return employee;
};

module.exports = { registerEmployee, loginEmployee };
