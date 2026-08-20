const express = require('express');
const Database = require('better-sqlite3');

const app = express();
app.use(express.json());
app.use(express.static('public'));
const PORT = 3000;
const db = new Database(process.env.DB_PATH || 'warehouse.db');

db.exec(`
     CREATE TABLE IF NOT EXISTS workers (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       name TEXT NOT NULL,
       role TEXT
     );
     CREATE TABLE IF NOT EXISTS tasks (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       title TEXT NOT NULL,
       status TEXT NOT NULL DEFAULT 'pending',
       worker_id INTEGER,
       FOREIGN KEY (worker_id) REFERENCES workers(id)
     );
   `);

app.get('/', (req, res) => {
  res.send('Warehouse tracker API is running');
});

app.get('/tasks', (req, res) => {
  const tasks = db.prepare(`
       SELECT tasks.id, tasks.title, tasks.status, workers.name AS assigned_to
       FROM tasks
       LEFT JOIN workers ON tasks.worker_id = workers.id
     `).all();
  res.json(tasks);
});

app.post('/tasks', (req, res) => {
  const { title, worker_id } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'title is required' });
  }

  const result = db.prepare(`
       INSERT INTO tasks (title, worker_id) VALUES (?, ?)
     `).run(title, worker_id ?? null);

  res.status(201).json({ id: result.lastInsertRowid, title, status: 'pending', worker_id });
});

app.patch('/tasks/:id', (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  if (!status) {
    return res.status(400).json({ error: 'status is required' });
  }

  const result = db.prepare(`UPDATE tasks SET status = ? WHERE id = ?`).run(status, id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'task not found' });
  }

  res.json({ id, status });
});

app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;

  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'task not found' });
  }

  res.status(204).send();
});

module.exports = app;