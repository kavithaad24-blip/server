import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function initializeDatabase() {
  let connection;
  
  try {
    // Connect without database first
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    // Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`✓ Database '${process.env.DB_NAME}' ready`);

    // Close and reconnect to the specific database
    await connection.end();

    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Users table created');

    // Create complaints table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS complaints (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        description TEXT NOT NULL,
        location VARCHAR(255),
        image VARCHAR(255),
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Complaints table created');

    // Create audit_reports table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS audit_reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        image VARCHAR(255) NOT NULL,
        description TEXT,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        zone VARCHAR(50),
        department VARCHAR(255),
        contractor VARCHAR(255),
        issues_json LONGTEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_zone (zone),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✓ Audit Reports table created');

    // Create services table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        department VARCHAR(100),
        average_processing_days INT DEFAULT 5,
        priority VARCHAR(50) DEFAULT 'Normal',
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Services table created');

    // Create service_requests table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS service_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        service_id INT NOT NULL,
        reference_number VARCHAR(50) UNIQUE,
        submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expected_completion_date DATE,
        actual_completion_date DATE,
        current_status VARCHAR(50) DEFAULT 'Submitted',
        processing_stage VARCHAR(100) DEFAULT 'Documents Verification',
        days_remaining INT,
        prediction_confidence INT DEFAULT 85,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_service_id (service_id),
        INDEX idx_status (current_status)
      )
    `);
    console.log('✓ Service Requests table created');

    // Insert sample services
    await connection.query(`
      INSERT IGNORE INTO services (name, description, department, average_processing_days, priority) VALUES
      ('Birth Certificate', 'Apply for birth certificate registration', 'Civil Registry', 3, 'High'),
      ('Property Tax Assessment', 'Request property tax reassessment', 'Municipal Tax', 7, 'Normal'),
      ('Water Connection', 'Apply for new water connection', 'Water Supply', 10, 'Normal'),
      ('Building Permission', 'Apply for construction/renovation permission', 'Municipal Corp', 15, 'High'),
      ('Trade License', 'Apply for business/trade license', 'Commerce', 5, 'Normal'),
      ('Driving License Renewal', 'Renew your driving license', 'RTO', 2, 'High'),
      ('Pension Application', 'Apply for government pension', 'Social Welfare', 20, 'Normal'),
      ('Housing Subsidy', 'Apply for affordable housing scheme', 'Housing', 30, 'Low')
    `);
    console.log('✓ Sample services inserted');

    console.log('\n✓ Database initialization complete!');
  } catch (error) {
    console.error('Error initializing database:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initializeDatabase();
