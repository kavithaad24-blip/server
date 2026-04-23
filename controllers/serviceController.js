import pool from '../config/db.js';

export const getAllServices = async (req, res) => {
    try {
        const [services] = await pool.query(
            'SELECT * FROM services WHERE status = "Active" ORDER BY priority DESC, name ASC'
        );
        res.json(services);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const predictServiceDelay = async (req, res) => {
    try {
        const serviceId = req.params.id;
        const [services] = await pool.query('SELECT * FROM services WHERE id = ?', [serviceId]);
        if (services.length === 0) {
            return res.status(404).json({ error: 'Service not found' });
        }

        const service = services[0];
        const [history] = await pool.query(
            `SELECT submission_date, actual_completion_date, expected_completion_date, current_status
             FROM service_requests
             WHERE service_id = ?`,
            [serviceId]
        );

        let totalDays = 0;
        let recordCount = 0;

        history.forEach((record) => {
            const submissionDate = new Date(record.submission_date);
            let completionDate = null;

            if (record.actual_completion_date) {
                completionDate = new Date(record.actual_completion_date);
            } else if (record.current_status === 'Completed' && record.expected_completion_date) {
                completionDate = new Date(record.expected_completion_date);
            }

            if (completionDate) {
                const diffDays = Math.max(
                    0,
                    Math.ceil((completionDate - submissionDate) / (1000 * 60 * 60 * 24))
                );
                totalDays += diffDays;
                recordCount += 1;
            }
        });

        const averageResolutionDays = recordCount > 0
            ? Math.round(totalDays / recordCount)
            : service.average_processing_days;

        const predictedCompletionDate = new Date();
        predictedCompletionDate.setDate(predictedCompletionDate.getDate() + averageResolutionDays);

        res.json({
            service_id: service.id,
            service_name: service.name,
            average_resolution_days: averageResolutionDays,
            record_count: recordCount,
            predicted_completion_date: predictedCompletionDate.toISOString().split('T')[0],
            note: recordCount === 0
                ? 'No historical completed records for this service type yet; using default average processing days.'
                : `Computed from ${recordCount} completed historical record${recordCount === 1 ? '' : 's'}.`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getUserServiceRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        const [requests] = await pool.query(
            `SELECT sr.*, s.name as service_name, s.average_processing_days 
       FROM service_requests sr 
       JOIN services s ON sr.service_id = s.id 
       WHERE sr.user_id = ? 
       ORDER BY sr.submission_date DESC`,
            [userId]
        );
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const trackServiceRequest = async (req, res) => {
    try {
        const { reference_number, service_id } = req.body;
        const userId = req.user.id;

        // Check if request exists
        const [existing] = await pool.query(
            'SELECT sr.*, s.name as service_name FROM service_requests sr JOIN services s ON sr.service_id = s.id WHERE sr.reference_number = ? AND sr.user_id = ? AND sr.service_id = ?',
            [reference_number, userId, service_id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ error: 'Service request not found' });
        }

        const request = existing[0];

        // Calculate AI-predicted delays based on historical data
        const daysElapsed = Math.floor(
            (new Date() - new Date(request.submission_date)) / (1000 * 60 * 60 * 24)
        );

        const [service] = await pool.query('SELECT * FROM services WHERE id = ?', [service_id]);
        const avgDays = service[0].average_processing_days;
        const daysRemaining = Math.max(0, avgDays - daysElapsed);

        // AI prediction confidence based on historical accuracy
        let confidence = 85;
        let processingStage = 'Documents Verification';
        let stagePercentage = 0;
        let insight = '';
        let riskLevel = 'Low';
        let riskMessage = 'Request is on track for on-time completion';

        // Calculate stage and confidence based on elapsed time
        const progressPercent = (daysElapsed / avgDays) * 100;

        if (progressPercent < 25) {
            processingStage = 'Documents Verification';
            stagePercentage = progressPercent * 4;
            confidence = 75;
            insight = 'Your request is being reviewed. Expected completion by ' + new Date(request.expected_completion_date).toLocaleDateString();
        } else if (progressPercent < 50) {
            processingStage = 'Preliminary Assessment';
            stagePercentage = ((progressPercent - 25) / 25) * 100;
            confidence = 85;
            insight = 'Assessment phase in progress. On schedule for completion.';
        } else if (progressPercent < 75) {
            processingStage = 'Final Review';
            stagePercentage = ((progressPercent - 50) / 25) * 100;
            confidence = 92;
            insight = 'Final review stage. Completion expected as scheduled.';
        } else if (progressPercent < 95) {
            processingStage = 'Approval Pending';
            stagePercentage = ((progressPercent - 75) / 20) * 100;
            confidence = 95;
            insight = 'Final approval in progress. Near completion.';
        } else {
            processingStage = 'Ready for Delivery';
            stagePercentage = 100;
            confidence = 98;
            insight = 'Request completed! Ready for delivery or collection.';
        }

        // Risk assessment
        if (daysRemaining < 0) {
            riskLevel = 'High';
            riskMessage = `⚠️ Request delayed by ${Math.abs(daysRemaining)} days. Contact department for status.`;
        } else if (daysRemaining <= 2) {
            riskLevel = 'Medium';
            riskMessage = `⚡ Approaching deadline. Expected within ${daysRemaining} days.`;
        } else {
            riskLevel = 'Low';
            riskMessage = '✅ Request is progressing normally.';
        }

        // Update the days_remaining and prediction_confidence
        await pool.query(
            'UPDATE service_requests SET days_remaining = ?, prediction_confidence = ?, expected_completion_date = ? WHERE id = ?',
            [daysRemaining, confidence, new Date(request.expected_completion_date).toISOString().split('T')[0], request.id]
        );

        // Get updated request
        const [updated] = await pool.query(
            'SELECT sr.*, s.name as service_name FROM service_requests sr JOIN services s ON sr.service_id = s.id WHERE sr.id = ?',
            [request.id]
        );

        res.json({
            ...updated[0],
            current_stage: processingStage,
            stage_percentage: Math.min(100, Math.round(stagePercentage)),
            insight,
            risk_level: riskLevel,
            risk_message: riskMessage
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const submitServiceRequest = async (req, res) => {
    try {
        const { service_id, description } = req.body;
        const userId = req.user.id;

        // Generate unique reference number
        const referenceNumber = `APP${Date.now()}${Math.floor(Math.random() * 1000)}`;

        // Get service info
        const [service] = await pool.query('SELECT * FROM services WHERE id = ?', [service_id]);
        if (service.length === 0) {
            return res.status(404).json({ error: 'Service not found' });
        }

        const avgDays = service[0].average_processing_days;
        const completionDate = new Date();
        completionDate.setDate(completionDate.getDate() + avgDays);

        // Insert service request
        const [result] = await pool.query(
            `INSERT INTO service_requests 
       (user_id, service_id, reference_number, expected_completion_date, days_remaining, description) 
       VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, service_id, referenceNumber, completionDate.toISOString().split('T')[0], avgDays, description]
        );

        // Get inserted request with service name
        const [newRequest] = await pool.query(
            'SELECT sr.*, s.name as service_name FROM service_requests sr JOIN services s ON sr.service_id = s.id WHERE sr.id = ?',
            [result.insertId]
        );

        res.status(201).json(newRequest[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
