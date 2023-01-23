const express = require('express');
const router = express.Router();


const recodingControllers = require("../controllers/recoding");
const middleware = require("../middleware/authenticateUser");

router.post("/acquire",middleware.authenticateToken,recodingControllers.acquire);
router.post("/start",middleware.authenticateToken,recodingControllers.start);
router.post("/stop",middleware.authenticateToken,recodingControllers.stop);

module.exports=router;