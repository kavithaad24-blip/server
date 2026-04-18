import db from '../config/db.js';
import detectIssues from '../utils/aiDetection.js';
import { mapLocationToDepartment, sendNotification } from '../utils/locationMapper.js';

export const submitAuditReport = async (req, res) => {
  try {
    const { description, latitude, longitude, contractorInput, reportStatus, address } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Location (latitude/longitude) is required' });
    }
    
    const imageFilename = req.file.filename;
    const imagePath = req.file.path;
    
    // Run AI detection on the image
    const detectedIssues = await detectIssues(imagePath);
    
    // Map location to department/contractor
    const locationData = mapLocationToDepartment(parseFloat(latitude), parseFloat(longitude));
    
    // Use user-provided contractor or fallback to mapped one
    const contractorName = contractorInput || locationData.contractor;
    const status = reportStatus || 'Pending';
    
    // Insert audit report into database
    const [result] = await db.query(
      `INSERT INTO audit_reports 
        (image, address, description, latitude, longitude, zone, department, contractor, issues_json, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        imageFilename,
        address || null,
        description,
        latitude,
        longitude,
        locationData.zone,
        locationData.department,
        contractorName,
        JSON.stringify(detectedIssues),
        status
      ]
    );
    
    // Send notification
    await sendNotification({
      ...locationData,
      contractor: contractorName,
      address: address,
      description,
      location: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
      issues: detectedIssues,
      reportId: result.insertId,
      status: status
    });
    
    // Return response with detected issues
    res.status(201).json({
      success: true,
      message: 'Audit report submitted successfully',
      reportId: result.insertId,
      detectedIssues: detectedIssues,
      department: locationData.department,
      contractor: contractorName,
      zone: locationData.zone
    });
  } catch (error) {
    console.error('Audit submission error:', error);
    res.status(500).json({ 
      error: 'Failed to submit audit report',
      details: error.message 
    });
  }
};

export const getAuditReports = async (req, res) => {
  try {
    const [reports] = await db.query(
      'SELECT id, image, description, latitude, longitude, zone, department, contractor, issues_json, status, created_at FROM audit_reports ORDER BY created_at DESC'
    );
    
    // Parse JSON issues
    const parsedReports = reports.map(report => ({
      ...report,
      issues: JSON.parse(report.issues_json)
    }));
    
    res.status(200).json({
      success: true,
      reports: parsedReports
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch audit reports',
      details: error.message 
    });
  }
};

export const getAuditReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const [reports] = await db.query(
      'SELECT * FROM audit_reports WHERE id = ?',
      [id]
    );
    
    if (reports.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    const report = {
      ...reports[0],
      issues: JSON.parse(reports[0].issues_json)
    };
    
    res.status(200).json({
      success: true,
      report
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch audit report',
      details: error.message 
    });
  }
};
