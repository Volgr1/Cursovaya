const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 10000;

// Подключение к PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(cors());
app.use(express.json());

// Автоматическое создание таблицы при запуске
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS goals (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        type TEXT CHECK (type IN ('okr', 'smart')) NOT NULL,
        category TEXT DEFAULT 'personal',
        status TEXT DEFAULT 'active',
        progress REAL DEFAULT 0,
        startDate TEXT,
        endDate TEXT,
        createdAt TEXT DEFAULT NOW()::TEXT,
        updatedAt TEXT DEFAULT NOW()::TEXT,
        milestones JSONB DEFAULT '[]',
        keyResults JSONB DEFAULT '[]'
      )
    `);
    console.log('Database initialized');
  } catch (err) {
    console.error('Database init error:', err);
  }
}

initDB();

// ============= API =============

// Получить все цели
app.get('/api/goals', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM goals ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить одну цель
app.get('/api/goals/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM goals WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Создать цель
app.post('/api/goals', async (req, res) => {
  try {
    const { title, description, type, category, endDate, milestones, keyResults } = req.body;
    const result = await pool.query(
      `INSERT INTO goals (title, description, type, category, endDate, milestones, keyResults)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, description, type, category, endDate, JSON.stringify(milestones || []), JSON.stringify(keyResults || [])]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Обновить цель
app.put('/api/goals/:id', async (req, res) => {
  try {
    const { title, description, progress, status, milestones, keyResults } = req.body;
    const result = await pool.query(
      `UPDATE goals SET title = COALESCE($1, title), description = COALESCE($2, description),
       progress = COALESCE($3, progress), status = COALESCE($4, status),
       milestones = COALESCE($5, milestones), keyResults = COALESCE($6, keyResults),
       updatedAt = NOW()::TEXT WHERE id = $7 RETURNING *`,
      [title, description, progress, status, milestones ? JSON.stringify(milestones) : null, keyResults ? JSON.stringify(keyResults) : null, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Удалить цель
app.delete('/api/goals/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM goals WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});