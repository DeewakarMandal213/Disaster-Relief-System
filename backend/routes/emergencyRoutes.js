const express = require("express");

const {
  createEmergency,
  getEmergencies,
  getMyEmergencies,
} = require("../controllers/emergencyController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new emergency report
router.post("/", protect, createEmergency);

// Get all emergency reports
router.get("/", protect, getEmergencies);

// Get only the logged-in user's emergency reports
router.get("/my", protect, getMyEmergencies);

module.exports = router;