// Mock AI detection system
const CORRUPTION_INDICATORS = {
  pothole: { severity: 'high', category: 'Infrastructure', cost: 5000 },
  crack: { severity: 'medium', category: 'Infrastructure', cost: 2000 },
  leakage: { severity: 'high', category: 'Water System', cost: 8000 },
  flooding: { severity: 'critical', category: 'Drainage', cost: 15000 },
  poor_road: { severity: 'medium', category: 'Road Maintenance', cost: 3000 },
  missing_signage: { severity: 'low', category: 'Safety', cost: 500 },
  debris: { severity: 'low', category: 'Cleaning', cost: 1000 },
  electrical_hazard: { severity: 'high', category: 'Electrical', cost: 10000 }
};

export const detectIssues = async (imagePath) => {
  // Mock AI analysis - randomly detect 1-3 issues
  return new Promise((resolve) => {
    setTimeout(() => {
      const issues = Object.entries(CORRUPTION_INDICATORS);
      const detectedCount = Math.floor(Math.random() * 3) + 1;
      const shuffled = issues.sort(() => Math.random() - 0.5);
      
      const detected = shuffled.slice(0, detectedCount).map(([issue, details]) => ({
        issue,
        ...details,
        confidence: Math.floor(Math.random() * 30) + 70 // 70-100% confidence
      }));
      
      resolve(detected);
    }, 1500);
  });
};

export default detectIssues;
