const express = require('express');
const router = express.Router();
const pool = require('../db'); // ใช้ pool จากการตั้งค่าฐานข้อมูล
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // กำหนดที่เก็บไฟล์

// เพิ่มรถยนต์
router.post('/vehicles', upload.single('imageURL'), async (req, res) => {
    const { brand, model, year, license_plate, rental_rate, status } = req.body;
    const imageURL = req.file ? req.file.filename : null; // รับชื่อไฟล์จาก multer
  
    console.log("Received data:", req.body);  // ตรวจสอบข้อมูลที่ได้รับจาก Client
    console.log("Received file:", req.file);  // ตรวจสอบไฟล์ที่ได้รับ
  
    try {
      const result = await pool.query(
        `INSERT INTO Vehicle (Brand, Model, Year, ImageURL, License_Plate, Rental_Rate, Status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [brand, model, year, imageURL, license_plate, rental_rate, status]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to add vehicle' });
    }
  });

// ลบรถยนต์
router.delete('/vehicles/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM Vehicle WHERE VehicleID = $1`, [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

// แก้ไขรถยนต์
router.put('/vehicles/:id', async (req, res) => {
  const { id } = req.params;
  const { brand, model, year, imageURL, license_plate, rental_rate, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE Vehicle 
       SET Brand = $1, Model = $2, Year = $3, ImageURL = $4, License_Plate = $5, Rental_Rate = $6, Status = $7 
       WHERE VehicleID = $8 RETURNING *`,
      [brand, model, year, imageURL, license_plate, rental_rate, status, id]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
});

module.exports = router;
