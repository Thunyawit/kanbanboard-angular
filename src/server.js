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

/// GET /api/boards - ดึงรายการ Board ทั้งหมด
app.get('/api/boards', async (req, res) => {
    try {
      let pool = await sql.connect(config);
      let result = await pool.request().query('SELECT * FROM Boards');
      res.json(result.recordset); // ส่ง array ของ boards กลับไป
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // POST /api/boards - สร้าง Board ใหม่
  app.post('/api/boards', async (req, res) => {
    const { name } = req.body;
    try {
      let pool = await sql.connect(config);
      let result = await pool.request()
        .input('name', sql.VarChar, name)
        .query(`
          INSERT INTO Boards (name)
          OUTPUT INSERTED.*
          VALUES (@name)
        `);
      // result.recordset[0] คือแถวที่ถูก INSERT
      res.status(201).json(result.recordset[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // - แก้ไข Board 
app.put('/api/boards/:boardId', async (req, res) => {
    const { boardId } = req.params;
    const { name } = req.body;
    try {
      let pool = await sql.connect(config);
      let result = await pool.request()
        .input('boardId', sql.Int, boardId)
        .input('name', sql.VarChar, name)
        .query(`
          UPDATE Boards
          SET name = @name
          OUTPUT INSERTED.*
          WHERE id = @boardId
        `);
  
      if (result.recordset.length === 0) {
        return res.status(404).json({ message: 'Board not found' });
      }
      res.json(result.recordset[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  
  // DELETE /api/boards/:boardId - ลบ Board (พร้อมลบ Task ที่เกี่ยวข้อง)
  app.delete('/api/boards/:boardId', async (req, res) => {
    const { boardId } = req.params;
    try {
      let pool = await sql.connect(config);
      // ลบ Task ที่อยู่ในบอร์ดก่อน
      await pool.request()
        .input('boardId', sql.Int, boardId)
        .query('DELETE FROM Tasks WHERE boardId = @boardId');
  
      // ลบ Board
      await pool.request()
        .input('boardId', sql.Int, boardId)
        .query('DELETE FROM Boards WHERE id = @boardId');
  
      res.json({ message: 'Board and related tasks deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // =========== จัดการ Tasks นะครับ ===========
  
  // GET /api/boards/:boardId/tasks - ดึง Task ของบอร์ดนั้น
  app.get('/api/boards/:boardId/tasks', async (req, res) => {
    const { boardId } = req.params;
    try {
      let pool = await sql.connect(config);
      let result = await pool.request()
        .input('boardId', sql.Int, boardId)
        .query('SELECT * FROM Tasks WHERE boardId = @boardId');
      res.json(result.recordset);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // POST /api/tasks - สร้าง Task ใหม่
  app.post('/api/tasks', async (req, res) => {
  const { boardId, title, description, status, tags } = req.body;
  try {
    let pool = await sql.connect(config);
    let result = await pool.request()
      .input('boardId', sql.Int, boardId)
      .input('title', sql.VarChar, title)
      .input('description', sql.VarChar, description || '')
      .input('status', sql.VarChar, status || 'todo')
      .input('tags', sql.VarChar, tags || '')
      .query(`
        INSERT INTO Tasks (boardId, title, [description], [status], tags)
        OUTPUT INSERTED.*
        VALUES (@boardId, @title, @description, @status, @tags)
      `);
    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

  
  // PUT /api/tasks/:taskId - แก้ไข Task 
  app.put('/api/tasks/:taskId', async (req, res) => {
    const { taskId } = req.params;
    const { title, description, status, tags } = req.body;
    try {
      let pool = await sql.connect(config);
      let result = await pool.request()
        .input('taskId', sql.Int, taskId)
        .input('title', sql.VarChar, title)
        .input('description', sql.VarChar, description)
        .input('status', sql.VarChar, status)
        .input('tags', sql.VarChar, tags)
        .query(`
          UPDATE Tasks
          SET title = @title,
              [description] = @description,
              [status] = @status,
              tags = @tags
          OUTPUT INSERTED.*
          WHERE id = @taskId
        `);
      if (result.recordset.length === 0) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.json(result.recordset[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  
  // DELETE /api/tasks/:taskId - ลบ Task
  app.delete('/api/tasks/:taskId', async (req, res) => {
    const { taskId } = req.params;
    try {
      let pool = await sql.connect(config);
      await pool.request()
        .input('taskId', sql.Int, taskId)
        .query('DELETE FROM Tasks WHERE id = @taskId');
  
      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // เริ่มต้นเซิร์ฟเวอร์
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
