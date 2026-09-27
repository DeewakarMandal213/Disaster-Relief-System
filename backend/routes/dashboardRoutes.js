const express = require("express");

const {
  getCitizenDashboardStats,
} = require("../controllers/dashboardController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// =========================================================
// CITIZEN DASHBOARD
// =========================================================

router.get(
  "/citizen",
  protect,
  getCitizenDashboardStats
);

module.exports = router;