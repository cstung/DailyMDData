const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, '../frontend/dist')));

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

let pool;

async function connectDB() {
    try {
        pool = mysql.createPool(dbConfig);
        console.log('MySQL Pool Created');
    } catch (err) {
        console.error('Database connection failed:', err);
    }
}

connectDB();

// GET: Fetch record for edit mode
app.get('/api/revenue', async (req, res) => {
    const { rptDate, mdName } = req.query;
    if (!rptDate || !mdName) {
        return res.status(400).json({ error: 'rptDate and mdName are required' });
    }

    try {
        const [rows] = await pool.execute(
            'SELECT * FROM report_daily_revenue WHERE rptDate = ? AND mdName = ?',
            [rptDate, mdName]
        );
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ message: 'Record not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Insert new record
app.post('/api/revenue', async (req, res) => {
    const data = req.body;
    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = fields.map(() => '?').join(', ');

    try {
        const query = `INSERT INTO report_daily_revenue (${fields.join(', ')}) VALUES (${placeholders})`;
        await pool.execute(query, values);
        res.status(201).json({ message: 'Record created successfully' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ error: 'Record already exists' });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
});

// PUT: Update existing record
app.put('/api/revenue', async (req, res) => {
    const data = req.body;
    const { rptDate, mdName, ...updates } = data;

    if (!rptDate || !mdName) {
        return res.status(400).json({ error: 'rptDate and mdName are required for update' });
    }

    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), rptDate, mdName];

    try {
        const query = `UPDATE report_daily_revenue SET ${setClause} WHERE rptDate = ? AND mdName = ?`;
        const [result] = await pool.execute(query, values);
        if (result.affectedRows > 0) {
            res.json({ message: 'Record updated successfully' });
        } else {
            res.status(404).json({ error: 'Record not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Anything that doesn't match the API routes, send back index.html
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 5432;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
