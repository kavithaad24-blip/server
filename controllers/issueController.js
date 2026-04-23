import pool from "../config/db.js";

export const getLocalIssues = async (req, res) => {
  try {
    const userId = req.user?.id;

    // Get all issues with vote status for current user
    const [issues] = await pool.query(`
      SELECT
        li.*,
        CASE WHEN iv.user_id IS NOT NULL THEN 1 ELSE 0 END as has_voted
      FROM local_issues li
      LEFT JOIN issue_votes iv ON li.id = iv.issue_id AND iv.user_id = ?
      WHERE li.status = 'Active'
      ORDER BY li.vote_count DESC, li.priority_score DESC
    `, [userId]);

    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const voteForIssue = async (req, res) => {
  try {
    const { issueId } = req.body;
    const userId = req.user.id;

    // Check if user already voted
    const [existingVote] = await pool.query(
      "SELECT id FROM issue_votes WHERE user_id = ? AND issue_id = ?",
      [userId, issueId]
    );

    if (existingVote.length > 0) {
      // Remove vote
      await pool.query("DELETE FROM issue_votes WHERE user_id = ? AND issue_id = ?", [userId, issueId]);
      await pool.query("UPDATE local_issues SET vote_count = vote_count - 1 WHERE id = ?", [issueId]);

      res.json({ message: "Vote removed", voted: false });
    } else {
      // Add vote
      await pool.query("INSERT INTO issue_votes (user_id, issue_id) VALUES (?, ?)", [userId, issueId]);
      await pool.query("UPDATE local_issues SET vote_count = vote_count + 1 WHERE id = ?", [issueId]);

      res.json({ message: "Vote added", voted: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getIssueStats = async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT
        COUNT(*) as total_issues,
        SUM(vote_count) as total_votes,
        AVG(vote_count) as avg_votes_per_issue
      FROM local_issues
      WHERE status = 'Active'
    `);

    res.json(stats[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};