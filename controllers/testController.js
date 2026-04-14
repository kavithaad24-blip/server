const pool = require('../config/db');

exports.testMessage = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    res.status(200).json({
      success: true,
      msg: "Hello from the test controller! Your route is working perfectly. Database replied with solution: " + rows[0].solution
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Failed to connect to database in test controller.",
      error: error.message
    });
  }
};
