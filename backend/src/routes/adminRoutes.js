const express = require("express");

const {
  createAdmin,
  getAdmins,
  toggleAdminStatus,
  updateAdmin,
  deleteAdmin,
} = require("../controllers/adminController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();


// Create Admin
router.post(
  "/",
  authenticate,
  authorize("SUPER_ADMIN"),
  createAdmin
);


// Get All Admins
router.get(
  "/",
  authenticate,
  authorize("SUPER_ADMIN"),
  getAdmins
);


// Enable / Disable Admin
router.patch(
  "/:id/toggle-status",
  authenticate,
  authorize("SUPER_ADMIN"),
  toggleAdminStatus
);


// Update Admin
router.patch(
  "/:id",
  authenticate,
  authorize("SUPER_ADMIN"),
  updateAdmin
);


// Delete Admin
router.delete(
  "/:id",
  authenticate,
  authorize("SUPER_ADMIN"),
  deleteAdmin
);


module.exports = router;