const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 10000;
const JWT_SECRET = process.env.JWT_SECRET || 'goal-tracker-secret-key-2024';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(cors());
app.use(express.json());

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

async function initDB() {
  try {
    // Пересоздаём таблицы с правильными именами колонок
    await pool.query(`DROP TABLE IF EXISTS goals CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS users CASCADE`);
    
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TEXT DEFAULT NOW()::TEXT
      )
    `);
    
    await pool.query(`
      CREATE TABLE goals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        type TEXT CHECK (type IN ('okr', 'smart')) NOT NULL,
        category TEXT DEFAULT 'personal',
        status TEXT DEFAULT 'active',
        progress REAL DEFAULT 0,
        start_date TEXT,
        end_date TEXT,
        created_at TEXT DEFAULT NOW()::TEXT,
        updated_at TEXT DEFAULT NOW()::TEXT,
        milestones JSONB DEFAULT '[]',
        key_results JSONB DEFAULT '[]'
      )
    `);
    console.log('Database initialized');
  } catch (err) {
    console.error('Database init error:', err);
  }
}

initDB();

// ============= AUTH API =============

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'All fields required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const existingUser = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($2)', [email, username]);
    if (existingUser.rows.length > 0) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, hashedPassword]
    );

    const token = jwt.sign({ id: result.rows[0].id, username: result.rows[0].username }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user: result.rows[0], token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const result = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { id: user.id, username: user.username, email: user.email, created_at: user.created_at }, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, email, created_at FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============= GOALS API =============

app.get('/api/goals', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM goals WHERE user_id = $1 ORDER BY id DESC', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/goals/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM goals WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/goals', authenticateToken, async (req, res) => {
  try {
    const { title, description, type, category, endDate, milestones, keyResults } = req.body;
    const result = await pool.query(
      `INSERT INTO goals (user_id, title, description, type, category, end_date, milestones, key_results)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.user.id, title, description, type, category, endDate, JSON.stringify(milestones || []), JSON.stringify(keyResults || [])]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/goals/:id', authenticateToken, async (req, res) => {
  try {
    const check = await pool.query('SELECT id FROM goals WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const { title, description, progress, status, milestones, keyResults } = req.body;
    const result = await pool.query(
      `UPDATE goals SET title = COALESCE($1, title), description = COALESCE($2, description),
       progress = COALESCE($3, progress), status = COALESCE($4, status),
       milestones = COALESCE($5, milestones), key_results = COALESCE($6, key_results),
       updated_at = NOW()::TEXT WHERE id = $7 AND user_id = $8 RETURNING *`,
      [title, description, progress, status, milestones ? JSON.stringify(milestones) : null, keyResults ? JSON.stringify(keyResults) : null, req.params.id, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/goals/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM goals WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});