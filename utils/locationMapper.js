// Mock location coordinates to department/contractor mapping
const LOCATION_ZONES = {
  downtown: {
    coordinates: { lat: 13.0827, lng: 80.2707 },
    department: 'Downtown Municipal Corporation',
    contractor: 'Urban Infrastructure Ltd',
    zone: 'Zone-A'
  },
  northside: {
    coordinates: { lat: 13.1939, lng: 80.2300 },
    department: 'North City Development',
    contractor: 'Northern Construction Co',
    zone: 'Zone-B'
  },
  southside: {
    coordinates: { lat: 12.9716, lng: 80.2300 },
    department: 'South Region Services',
    contractor: 'Southern Infrastructure Inc',
    zone: 'Zone-C'
  },
  eastend: {
    coordinates: { lat: 13.0827, lng: 80.3100 },
    department: 'East City Works',
    contractor: 'Eastern Maintenance Ltd',
    zone: 'Zone-D'
  },
  westend: {
    coordinates: { lat: 13.0827, lng: 80.2300 },
    department: 'West Municipal Services',
    contractor: 'Western Repairs Co',
    zone: 'Zone-E'
  }
};

export const mapLocationToDepartment = (latitude, longitude) => {
  // Mock: Return based on coordinates proximity
  const zones = Object.values(LOCATION_ZONES);
  
  // Simple distance calculation
  const closest = zones.reduce((prev, curr) => {
    const prevDist = Math.abs(prev.coordinates.lat - latitude) + Math.abs(prev.coordinates.lng - longitude);
    const currDist = Math.abs(curr.coordinates.lat - latitude) + Math.abs(curr.coordinates.lng - longitude);
    return currDist < prevDist ? curr : prev;
  });
  
  return {
    zone: closest.zone,
    department: closest.department,
    contractor: closest.contractor,
    coordinates: { latitude, longitude }
  };
};

export const sendNotification = async (auditData) => {
  // Mock notification system
  const notification = {
    timestamp: new Date().toISOString(),
    type: 'corruption_audit_report',
    department: auditData.department,
    contractor: auditData.contractor,
    zone: auditData.zone,
    issues: auditData.issues,
    location: auditData.location,
    description: auditData.description
  };
  
  // Mock log to console
  console.log('📧 NOTIFICATION SENT:');
  console.log('=====================================');
  console.log(`To: ${notification.department}`);
  console.log(`Contractor: ${notification.contractor}`);
  console.log(`Zone: ${notification.zone}`);
  console.log(`Issues Detected: ${notification.issues.length}`);
  notification.issues.forEach(issue => {
    console.log(`  - ${issue.issue} (${issue.severity}) - Confidence: ${issue.confidence}%`);
  });
  console.log(`Location: Lat ${notification.location.latitude.toFixed(4)}, Lng ${notification.location.longitude.toFixed(4)}`);
  console.log('=====================================\n');
  
  return notification;
};

export default { mapLocationToDepartment, sendNotification };
