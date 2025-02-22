const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const jwt = require('jsonwebtoken');
const cors = require('cors');



const app = express();
app.use(bodyParser.json());
app.use(cors());

// กำหนดค่า config สำหรับเชื่อมต่อ MSSQL
const config = {
  user: 'sa',
  password: 'Thunyawit092',
  server: 'localhost', 
  database: 'MyAppDB',
  options: {
    encrypt: true, 
    trustServerCertificate: true 
  }
};

// Endpoint สำหรับการลงทะเบียน
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    let pool = await sql.connect(config);
    // ตรวจสอบว่ามี username นี้อยู่แล้วหรือไม่
    let checkResult = await pool.request()
      .input('username', sql.VarChar, username)
      .query('SELECT * FROM Users WHERE username = @username');

    if (checkResult.recordset.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // สำหรับการใช้งานจริง ควรเข้ารหัสรหัสผ่านด้วย bcrypt
    await pool.request()
      .input('username', sql.VarChar, username)
      .input('password', sql.VarChar, password)
      .query('INSERT INTO Users (username, password) VALUES (@username, @password)');

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint สำหรับการ login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    let pool = await sql.connect(config);
    let result = await pool.request()
      .input('username', sql.VarChar, username)
      .input('password', sql.VarChar, password)
      .query('SELECT * FROM Users WHERE username = @username AND password = @password');

    if (result.recordset.length > 0) {
      // สร้าง JWT token (สำหรับ production ควรจัดการ secret key ด้วย environment variables)
      const token = jwt.sign({ username }, 'your_jwt_secret', { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// เริ่มต้นเซิร์ฟเวอร์
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
