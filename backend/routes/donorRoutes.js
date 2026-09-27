const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  createDonation,
  getMyDonations,
  getDonationByReference,
  getDonorStats,
} = require("../controllers/donorController");


// =========================================================
// DONOR ROUTES
// =========================================================

// All routes below require:
// 1. Valid JWT
// 2. Donor role

router.use(
  protect,
  authorizeRoles("Donor")
);


// =========================================================
// Create Donation
// =========================================================

router.post(
  "/",
  createDonation
);


// =========================================================
// Get My Donations
// =========================================================

router.get(
  "/my-donations",
  getMyDonations
);


// =========================================================
// Get Donor Statistics
// =========================================================

router.get(
  "/stats",
  getDonorStats
);


// =========================================================
// Get Single Donation
// =========================================================

router.get(
  "/reference/:referenceId",
  getDonationByReference
);


module.exports = router;