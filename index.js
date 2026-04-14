const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the MySQL database:', err.message);
  } else {
    console.log('Successfully connected to the MySQL database.');
    connection.release();
  }
});

// Import routes
const testRoutes = require('./routes/testRoutes');

// Use routes
app.use('/api', testRoutes);

app.get('/', (req, res) => {
  res.send('Citizen Service Portal Server is running and connected to database!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
