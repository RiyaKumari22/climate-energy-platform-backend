
const express = require("express");
const multer = require("multer");

const {
  uploadDataset,
  getAllDatasets,
  approveDataset,
  rejectDataset,
  getPublicDatasets,
  updateDataset,
  deleteDataset,
} = require("../controllers/datasetController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// Multer Configuration
// =====================================================

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },

  fileFilter: (req, file, cb) => {
    const isCSV =
      file.mimetype === "text/csv" ||
      file.mimetype === "application/csv" ||
      file.originalname.toLowerCase().endsWith(".csv");

    if (isCSV) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  },
});

// =====================================================
// Get All Datasets
// Admin + Super Admin
// =====================================================

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  getAllDatasets
);

// =====================================================
// Upload Dataset
// Admin + Super Admin
// =====================================================

router.post(
  "/upload",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  upload.single("file"),
  uploadDataset
);

// =====================================================
// Public Approved Datasets
// No Login Required
// =====================================================

router.get(
  "/public",
  getPublicDatasets
);

// =====================================================
// Approve Dataset
// Super Admin Only
// =====================================================

router.patch(
  "/:id/approve",
  authenticate,
  authorize("SUPER_ADMIN"),
  approveDataset
);

// =====================================================
// Reject Dataset
// Super Admin Only
// =====================================================

router.patch(
  "/:id/reject",
  authenticate,
  authorize("SUPER_ADMIN"),
  rejectDataset
);

// =====================================================
// Edit Dataset
// Super Admin Only
// =====================================================

router.patch(
  "/:id",
  authenticate,
  authorize("SUPER_ADMIN"),
  updateDataset
);

// =====================================================
// Delete Dataset
// Super Admin Only
// =====================================================

router.delete(
  "/:id",
  authenticate,
  authorize("SUPER_ADMIN"),
  deleteDataset
);

// =====================================================
// Multer / Upload Error Handler
// =====================================================

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "CSV file size cannot exceed 5 MB",
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  next();
});

module.exports = router;
