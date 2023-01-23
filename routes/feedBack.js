const express = require('express');
const router = express.Router();

const feedBackControllers = require('../controllers/feedBack');
const authenticateMiddleware = require("../middleware/authenticateUser");

router.post("/user_feed_back",authenticateMiddleware.authenticateToken,feedBackControllers.post_feedBack);
router.get("/user_feed_back",feedBackControllers.get_feedBack);


module.exports=router;