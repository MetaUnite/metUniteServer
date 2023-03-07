const router = require("express").Router();
const adminController = require("../controllers/admin");
const auth = require("../middleware/authenticateUser");
router.post("/signup", adminController.admin_signup);
router.post("/login", adminController.login);
router.post("/forgotPassword", adminController.forgotPassword);
router.post("/resetPassword", adminController.updatePassword);
router.post("/logout", adminController.logout);
router.post("/send-otp", adminController.send_otp_toEmail);
router.post("/admin_id", adminController.getAdminById);
router.post("/updateAdmin", auth.authenticateToken,adminController.admin_update);

module.exports = router;
