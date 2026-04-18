-- Create users table with password column
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create complaints table
CREATE TABLE IF NOT EXISTS complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  description TEXT NOT NULL,
  location VARCHAR(255),
  image VARCHAR(255),
  status VARCHAR(50) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create audit_reports table for AI Corruption Audit module
CREATE TABLE IF NOT EXISTS audit_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  image VARCHAR(255) NOT NULL,
  image_url TEXT,
  address VARCHAR(255),
  description TEXT NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  detected_issues TEXT,
  zone VARCHAR(100),
  department VARCHAR(100),
  contractor VARCHAR(100),
  issues_json JSON,
  status VARCHAR(50) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_department (department),
  INDEX idx_contractor (contractor),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Create services table for Service Delay Prediction
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
);

-- Create service_requests table for tracking user service applications
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
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (service_id) REFERENCES services(id),
  INDEX idx_user_id (user_id),
  INDEX idx_service_id (service_id),
  INDEX idx_status (current_status)
);

-- Insert sample services
INSERT IGNORE INTO services (name, description, department, average_processing_days, priority) VALUES
('Birth Certificate', 'Apply for birth certificate registration', 'Civil Registry', 3, 'High'),
('Property Tax Assessment', 'Request property tax reassessment', 'Municipal Tax', 7, 'Normal'),
('Water Connection', 'Apply for new water connection', 'Water Supply', 10, 'Normal'),
('Building Permission', 'Apply for construction/renovation permission', 'Municipal Corp', 15, 'High'),
('Trade License', 'Apply for business/trade license', 'Commerce', 5, 'Normal'),
('Driving License Renewal', 'Renew your driving license', 'RTO', 2, 'High'),
('Pension Application', 'Apply for government pension', 'Social Welfare', 20, 'Normal'),
('Housing Subsidy', 'Apply for affordable housing scheme', 'Housing', 30, 'Low');
