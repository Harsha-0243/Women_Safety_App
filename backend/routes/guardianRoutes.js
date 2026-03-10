const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/guardianController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Guardian Management Routes
router.post('/request', sendGuardianRequest);              // Send guardian request
router.get('/requests/pending', getPendingRequests);       // Get my pending requests
router.post('/requests/respond', respondToRequest);        // Accept/Reject request
router.get('/my-guardians', getMyGuardians);               // Get people protecting me
router.get('/people-im-guarding', getPeopleImGuarding);    // Get people I'm protecting
router.delete('/remove', removeGuardian);                  // Remove a guardian
router.get('/user/:userId', getUserDetails);               // Get guarded user details

// Danger Alert Routes
router.post('/danger-alert', triggerDangerAlert);          // Trigger SOS alert
router.get('/alerts', getAlertsForGuardian);               // Get alerts sent to me
router.post('/alerts/mark-seen', markAlertAsSeen);         // Mark alert as seen

module.exports = router;