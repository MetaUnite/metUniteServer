const express = require('express');
const router = express.Router();

const rtmTokenController = require('../controllers/rtcAndRtmToken');
const middleware = require('../middleware/authenticateUser');

router.get('/generateRtmToken', middleware.authenticateToken,rtmTokenController.generateRtmToken);
router.post('/generateRtcToken', middleware.authenticateToken,rtmTokenController.generateRtcToken);

module.exports = router;