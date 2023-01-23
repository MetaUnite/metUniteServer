const express = require('express');
const router = express.Router();

const userController = require('../controllers/user');
const middleware = require('../middleware/authenticateUser');


// router.put("/update_device_token",middleware.authenticateToken,deviceController.device_token);
router.post('/signup',userController.user_create);
router.post('/email_verification',middleware.authenticateToken,userController.email_verifier);
router.post('/resend_otp',middleware.authenticateToken,userController.resend_otp)
router.get('/get_profile',middleware.authenticateToken,userController.get_user)
router.post('/login',userController.user_login);
router.post('/forgot_password',userController.forgot_password);
router.post('/set_password',middleware.authenticateToken,userController.new_password);
router.post('/delete_account',middleware.authenticateToken,userController.delete_account);
router.put('/change_password',middleware.authenticateToken,userController.change_password);
router.get('/logout',middleware.authenticateToken,userController.logout);
router.post('/edit_profile',middleware.authenticateToken,userController.edit_profile);
router.get('/get_all_user',userController.get_all_users);
router.get('/get_today_login_user',userController.get_today_login_user);
router.post('/add_filed',userController.add_loginDate_filed);
router.post('/block_user/:id',userController.block_user);
router.post('/unblock_user/:id',userController.unblock_user);

module.exports=router;
