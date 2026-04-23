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
  address VARCHAR(255),
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

-- Create local_issues table for Community Prioritization
CREATE TABLE IF NOT EXISTS local_issues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  location VARCHAR(255),
  priority_score INT DEFAULT 0,
  vote_count INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_status (status),
  INDEX idx_vote_count (vote_count)
);

-- Create issue_votes table for tracking user votes
CREATE TABLE IF NOT EXISTS issue_votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  issue_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (issue_id) REFERENCES local_issues(id),
  UNIQUE KEY unique_user_issue (user_id, issue_id),
  INDEX idx_user_id (user_id),
  INDEX idx_issue_id (issue_id)
);

-- Insert sample local issues
INSERT IGNORE INTO local_issues (title, description, category, location, priority_score) VALUES
('Fix Potholes on Main Street', 'Multiple large potholes causing traffic hazards and vehicle damage', 'Infrastructure', 'Main Street, Downtown', 85),
('Upgrade Street Lights in Zone 4', 'Many street lights are not working, affecting safety at night', 'Infrastructure', 'Zone 4, Residential Area', 72),
('Park Maintenance Required', 'Park benches broken, grass overgrown, playground equipment damaged', 'Environment', 'Central Park', 68),
('Clean Drainage System', 'Blocked drains causing water stagnation and mosquito breeding', 'Sanitation', 'Market Area', 91),
('Repair Broken Traffic Signals', 'Traffic signals malfunctioning at busy intersection', 'Infrastructure', 'Transport Hub', 78),
('Install Speed Bumps', 'High speed traffic in residential areas', 'Safety', 'School Zone', 65);
