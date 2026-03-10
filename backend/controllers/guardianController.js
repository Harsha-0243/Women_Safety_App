 const db = require('../config/db');

// ============================================
// 1. Send Guardian Request
// ============================================
const sendGuardianRequest = async (req, res) => {
  try {
    const { guardianUsername } = req.body;
    const userId = req.user.userId; // From JWT token

    console.log('📤 Guardian request from user:', userId, 'to:', guardianUsername);

    // Validation
    if (!guardianUsername) {
      return res.status(400).json({
        success: false,
        message: 'Guardian username is required'
      });
    }

    // Check if guardian user exists
    const [guardianUsers] = await db.query(
      'SELECT id, username, name FROM users WHERE username = ?',
      [guardianUsername]
    );

    if (guardianUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const guardianId = guardianUsers[0].id;

    // Can't add yourself as guardian
    if (guardianId === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot add yourself as a guardian'
      });
    }

    // Check if relationship already exists
    const [existing] = await db.query(
      'SELECT * FROM guardian_relationships WHERE user_id = ? AND guardian_id = ?',
      [userId, guardianId]
    );

    if (existing.length > 0) {
      const currentStatus = existing[0].status;
      
      if (currentStatus === 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Guardian request already pending'
        });
      } else if (currentStatus === 'accepted') {
        return res.status(400).json({
          success: false,
          message: 'This user is already your guardian'
        });
      } else if (currentStatus === 'rejected') {
        // Re-send request if previously rejected
        await db.query(
          'UPDATE guardian_relationships SET status = ?, requested_at = NOW(), responded_at = NULL WHERE id = ?',
          ['pending', existing[0].id]
        );
        
        return res.status(200).json({
          success: true,
          message: 'Guardian request sent successfully'
        });
      }
    }

    // Create new guardian request
    await db.query(
      'INSERT INTO guardian_relationships (user_id, guardian_id, status) VALUES (?, ?, ?)',
      [userId, guardianId, 'pending']
    );

    console.log('✅ Guardian request created');

    return res.status(201).json({
      success: true,
      message: 'Guardian request sent successfully'
    });

  } catch (error) {
    console.error('❌ Send guardian request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while sending request'
    });
  }
};

// ============================================
// 2. Get Pending Requests (for Guardian)
// ============================================
const getPendingRequests = async (req, res) => {
  try {
    const guardianId = req.user.userId;

    const [requests] = await db.query(
      `SELECT 
        gr.id as request_id,
        gr.user_id,
        gr.requested_at,
        u.name,
        u.username,
        u.email,
        u.mobile_number
       FROM guardian_relationships gr
       JOIN users u ON gr.user_id = u.id
       WHERE gr.guardian_id = ? AND gr.status = 'pending'
       ORDER BY gr.requested_at DESC`,
      [guardianId]
    );

    console.log('📬 Pending requests for guardian', guardianId, ':', requests.length);

    return res.status(200).json({
      success: true,
      requests
    });

  } catch (error) {
    console.error('❌ Get pending requests error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============================================
// 3. Respond to Guardian Request
// ============================================
const respondToRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body; // action: 'accept' or 'reject'
    const guardianId = req.user.userId;

    console.log('📝 Responding to request:', requestId, 'Action:', action);

    // Validation
    if (!requestId || !action || !['accept', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request parameters'
      });
    }

    // Verify request belongs to this guardian and is pending
    const [requests] = await db.query(
      'SELECT * FROM guardian_relationships WHERE id = ? AND guardian_id = ? AND status = ?',
      [requestId, guardianId, 'pending']
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Request not found or already processed'
      });
    }

    const newStatus = action === 'accept' ? 'accepted' : 'rejected';

    // Update request status
    await db.query(
      'UPDATE guardian_relationships SET status = ?, responded_at = NOW() WHERE id = ?',
      [newStatus, requestId]
    );

    console.log('✅ Request', action === 'accept' ? 'accepted' : 'rejected');

    return res.status(200).json({
      success: true,
      message: action === 'accept' ? 'Guardian request accepted' : 'Guardian request rejected',
      action: newStatus
    });

  } catch (error) {
    console.error('❌ Respond to request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============================================
// 4. Get My Guardians (people protecting me)
// ============================================
const getMyGuardians = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [guardians] = await db.query(
      `SELECT 
        u.id,
        u.name,
        u.username,
        u.email,
        u.mobile_number,
        gr.created_at as guardian_since
       FROM guardian_relationships gr
       JOIN users u ON gr.guardian_id = u.id
       WHERE gr.user_id = ? AND gr.status = 'accepted'
       ORDER BY gr.created_at DESC`,
      [userId]
    );

    console.log('🛡️ My guardians:', guardians.length);

    return res.status(200).json({
      success: true,
      guardians
    });

  } catch (error) {
    console.error('❌ Get my guardians error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============================================
// 5. Get People I'm Guarding
// ============================================
const getPeopleImGuarding = async (req, res) => {
  try {
    const guardianId = req.user.userId;

    const [people] = await db.query(
      `SELECT 
        u.id,
        u.name,
        u.username,
        u.email,
        u.mobile_number,
        gr.created_at as guarding_since
       FROM guardian_relationships gr
       JOIN users u ON gr.user_id = u.id
       WHERE gr.guardian_id = ? AND gr.status = 'accepted'
       ORDER BY gr.created_at DESC`,
      [guardianId]
    );

    console.log('👥 People I\'m guarding:', people.length);

    return res.status(200).json({
      success: true,
      people
    });

  } catch (error) {
    console.error('❌ Get people I\'m guarding error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============================================
// 6. Remove Guardian
// ============================================
const removeGuardian = async (req, res) => {
  try {
    const { guardianId } = req.body;
    const userId = req.user.userId;

    console.log('🗑️ Removing guardian:', guardianId, 'from user:', userId);

    await db.query(
      'DELETE FROM guardian_relationships WHERE user_id = ? AND guardian_id = ? AND status = ?',
      [userId, guardianId, 'accepted']
    );

    return res.status(200).json({
      success: true,
      message: 'Guardian removed successfully'
    });

  } catch (error) {
    console.error('❌ Remove guardian error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============================================
// 7. Trigger DANGER Alert
// ============================================
const triggerDangerAlert = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { latitude, longitude, message } = req.body;

    console.log('🚨🚨🚨 DANGER ALERT TRIGGERED by user:', userId);

    // Create danger alert record
    const [result] = await db.query(
      'INSERT INTO danger_alerts (user_id, latitude, longitude, message) VALUES (?, ?, ?, ?)',
      [userId, latitude || null, longitude || null, message || 'Emergency - Help Needed!']
    );

    const alertId = result.insertId;

    // Get all accepted guardians of this user
    const [guardians] = await db.query(
      `SELECT guardian_id FROM guardian_relationships 
       WHERE user_id = ? AND status = 'accepted'`,
      [userId]
    );

    console.log('📢 Notifying', guardians.length, 'guardians');

    // Create notification for each guardian
    if (guardians.length > 0) {
      const notificationValues = guardians.map(g => [alertId, g.guardian_id]);
      
      await db.query(
        'INSERT INTO alert_notifications (alert_id, guardian_id) VALUES ?',
        [notificationValues]
      );
    }

    return res.status(201).json({
      success: true,
      message: guardians.length > 0 
        ? `Danger alert sent to ${guardians.length} guardian(s)` 
        : 'Danger alert created (no guardians to notify)',
      alertId,
      guardiansNotified: guardians.length
    });

  } catch (error) {
    console.error('❌ Trigger danger alert error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while triggering alert'
    });
  }
};

// ============================================
// 8. Get Alerts for Guardian
// ============================================
const getAlertsForGuardian = async (req, res) => {
  try {
    const guardianId = req.user.userId;

    const [alerts] = await db.query(
      `SELECT 
        da.id as alert_id,
        da.user_id,
        da.latitude,
        da.longitude,
        da.message,
        da.status as alert_status,
        da.created_at,
        u.name as user_name,
        u.username,
        u.mobile_number,
        an.seen,
        an.seen_at
       FROM alert_notifications an
       JOIN danger_alerts da ON an.alert_id = da.id
       JOIN users u ON da.user_id = u.id
       WHERE an.guardian_id = ?
       ORDER BY da.created_at DESC
       LIMIT 50`,
      [guardianId]
    );

    console.log('🚨 Alerts for guardian:', alerts.length);

    return res.status(200).json({
      success: true,
      alerts
    });

  } catch (error) {
    console.error('❌ Get alerts error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============================================
// 9. Mark Alert as Seen
// ============================================
const markAlertAsSeen = async (req, res) => {
  try {
    const { alertId } = req.body;
    const guardianId = req.user.userId;

    await db.query(
      'UPDATE alert_notifications SET seen = TRUE, seen_at = NOW() WHERE alert_id = ? AND guardian_id = ?',
      [alertId, guardianId]
    );

    console.log('✅ Alert marked as seen');

    return res.status(200).json({
      success: true,
      message: 'Alert marked as seen'
    });

  } catch (error) {
    console.error('❌ Mark alert as seen error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============================================
// 10. Get User Details (for guardian to view)
// ============================================
const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const guardianId = req.user.userId;

    // Verify guardian relationship exists
    const [relationship] = await db.query(
      'SELECT * FROM guardian_relationships WHERE user_id = ? AND guardian_id = ? AND status = ?',
      [userId, guardianId, 'accepted']
    );

    if (relationship.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this user'
      });
    }

    // Get user details
    const [users] = await db.query(
      'SELECT id, name, username, email, mobile_number, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get recent alerts from this user
    const [alerts] = await db.query(
      `SELECT id, latitude, longitude, message, status, created_at, resolved_at
       FROM danger_alerts
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 10`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      user: users[0],
      recentAlerts: alerts
    });

  } catch (error) {
    console.error('❌ Get user details error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  sendGuardianRequest,
  getPendingRequests,
  respondToRequest,
  getMyGuardians,
  getPeopleImGuarding,
  removeGuardian,
  triggerDangerAlert,
  getAlertsForGuardian,
  markAlertAsSeen,
  getUserDetails
};