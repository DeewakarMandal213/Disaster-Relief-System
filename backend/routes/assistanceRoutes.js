const express = require("express");

const {
  createAssistance,
  getAssistances,
  getMyAssistances,
} = require("../controllers/assistanceController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// =========================================================
// CREATE ASSISTANCE REQUEST
// =========================================================

router.post(
  "/",
  protect,
  createAssistance
);


// =========================================================
// GET LOGGED-IN CITIZEN'S REQUESTS
// =========================================================

router.get(
  "/my",
  protect,
  getMyAssistances
);


// =========================================================
// GET ALL ASSISTANCE REQUESTS
// =========================================================

router.get(
  "/",
  protect,
  getAssistances
);


module.exports = router;