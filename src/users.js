const express = require('express');
const pool = require('./db');
const { validateUser } = require('./validation');

const router = express.Router();
const userColumns = 'id, name, email, age, created_at, updated_at';

function parseId(value) {
  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }
  const id = Number(value);
  return Number.isSafeInteger(id) && id <= 4294967295 ? id : null;
}

function sendValidationErrors(res, errors) {
  return res.status(400).json({ error: 'Validation failed', details: errors });
}

router.post('/', async (req, res, next) => {
  const { errors, values } = validateUser(req.body);
  if (errors.length) {
    return sendValidationErrors(res, errors);
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, age) VALUES (?, ?, ?)',
      [values.name, values.email, values.age ?? null]
    );
    const [rows] = await pool.execute(
      `SELECT ${userColumns} FROM users WHERE id = ?`,
      [result.insertId]
    );
    return res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A user with this email already exists.' });
    }
    return next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`SELECT ${userColumns} FROM users ORDER BY id`);
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'User id must be a positive integer.' });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT ${userColumns} FROM users WHERE id = ?`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.json(rows[0]);
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'User id must be a positive integer.' });
  }

  const { errors, values } = validateUser(req.body, { partial: true });
  if (errors.length) {
    return sendValidationErrors(res, errors);
  }

  const updates = Object.keys(values);
  const assignments = updates.map((field) => `${field} = ?`).join(', ');
  try {
    const [result] = await pool.execute(
      `UPDATE users SET ${assignments} WHERE id = ?`,
      [...updates.map((field) => values[field]), id]
    );
    if (result.affectedRows === 0) {
      const [existingRows] = await pool.execute(
        `SELECT ${userColumns} FROM users WHERE id = ?`,
        [id]
      );
      if (existingRows.length === 0) {
        return res.status(404).json({ error: 'User not found.' });
      }
      return res.json(existingRows[0]);
    }
    const [rows] = await pool.execute(
      `SELECT ${userColumns} FROM users WHERE id = ?`,
      [id]
    );
    return res.json(rows[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A user with this email already exists.' });
    }
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'User id must be a positive integer.' });
  }

  try {
    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
