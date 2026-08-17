const express = require('express');
   const Database = require('better-sqlite3');

   const app = express();
   const PORT = 3000;
   const db = new Database('warehouse.db');

   app.get('/', (req, res) => {
     res.send('Warehouse tracker API is running');
   });

   app.get('/tasks', (req, res) => {
     const tasks = db.prepare(`
       SELECT tasks.id, tasks.title, tasks.status, workers.name AS assigned_to
       FROM tasks
       JOIN workers ON tasks.worker_id = workers.id
     `).all();
     res.json(tasks);
   });

   app.listen(PORT, () => {
     console.log(`Server running on http://localhost:${PORT}`);
   });