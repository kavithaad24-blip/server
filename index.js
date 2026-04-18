import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import pool from './config/db.js';
import testRoutes from './routes/testRoutes.js';
import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Function to create demo account on startup
const createDemoAccount = async () => {
  try {
    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', ['demo@citizen.gov']);
    
    if (existing.length === 0) {
      const hashedPassword = await bcrypt.hash('Demo@12345', 10);
      try {
        await pool.query(
          'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
          ['Demo User', 'demo@citizen.gov', hashedPassword]
        );
        console.log('✅ Demo account created: demo@citizen.gov / Demo@12345');
      } catch (dbErr) {
        console.log('⚠️ Demo account setup skipped (database pending)');
      }
    } else {
      console.log('✅ Demo account already exists: demo@citizen.gov / Demo@12345');
    }
  } catch (error) {
    console.log('⚠️ Demo account setup - will be available after database initialization');
  }
};

// Test DB connection on startup
pool.getConnection()
  .then(connection => {
    console.log('Successfully connected to the MySQL database.');
    connection.release();
    
    // Create demo account after DB connection
    createDemoAccount();
  })
  .catch(err => {
    console.error('Error connecting to the MySQL database:', err.message);
  });

// Use routes
app.use('/api', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/audit', auditRoutes);

app.get('/', (req, res) => {
  res.send('Citizen Service Portal Server is running and connected to database!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
