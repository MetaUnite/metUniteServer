const express = require('express');
const router = express.Router();


const roomController = require("../controllers/room");
const middleware = require("../middleware/authenticateUser");

router.post("/create_room",middleware.authenticateToken,roomController.create_room);
router.post("/join_meting",middleware.authenticateToken,roomController.join_room);
router.post("/fetch_room",middleware.authenticateToken,roomController.fetch_room_data);
router.get('/get_all_room',roomController.get_all_room);
router.post('/add_meet_filed',roomController.add_meetDate_filed);
router.post('/delete_room/:id',roomController.delete_room);


module.exports=router;