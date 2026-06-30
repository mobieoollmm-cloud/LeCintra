const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(express.static(path.join(__dirname, ''))); // Serve static files from current directory

// Initialize SQLite database
const db = new sqlite3.Database('./reservations.db', (err) => {
  if (err) {
    console.error('Error connecting to database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    // Create table if it doesn't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS reservations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        guests INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
});

// API Endpoint to handle reservation submissions
app.post('/api/reservations', (req, res) => {
  const { name, phone, date, time, guests } = req.body;

  // Basic validation
  if (!name || !phone || !date || !time || !guests) {
    return res.status(400).json({ error: 'Please provide all required fields.' });
  }

  const sql = `INSERT INTO reservations (name, phone, date, time, guests) VALUES (?, ?, ?, ?, ?)`;
  const params = [name, phone, date, time, guests];

  db.run(sql, params, function(err) {
    if (err) {
      console.error('Error inserting reservation:', err.message);
      return res.status(500).json({ error: 'Failed to save reservation.' });
    }
    console.log(`Reservation saved successfully with ID: ${this.lastID}`);
    res.status(201).json({
      message: 'Reservation successful!',
      reservationId: this.lastID
    });
  });
});

// API Endpoint to fetch all reservations
app.get('/api/reservations', (req, res) => {
  const sql = `SELECT * FROM reservations ORDER BY created_at DESC`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching reservations:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve reservations.' });
    }
    res.status(200).json(rows);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
