const express = require("express");

const {
  getVolunteerRequests,
  getMyVolunteerRequests,
  acceptEmergency,
  acceptAssistance,
  updateEmergencyStatus,
  updateAssistanceStatus,
} = require("../controllers/volunteerController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();


// =========================================================
// VOLUNTEER ACCESS
// =========================================================

router.use(
  protect,
  authorizeRoles("Volunteer")
);


// =========================================================
// GET AVAILABLE REQUESTS
// =========================================================

router.get(
  "/requests",
  getVolunteerRequests
);


// =========================================================
// GET MY ASSIGNED REQUESTS
// =========================================================

router.get(
  "/my-requests",
  getMyVolunteerRequests
);


// =========================================================
// ACCEPT EMERGENCY
// =========================================================

router.put(
  "/emergency/:id/accept",
  acceptEmergency
);


// =========================================================
// ACCEPT ASSISTANCE
// =========================================================

router.put(
  "/assistance/:id/accept",
  acceptAssistance
);


// =========================================================
// UPDATE EMERGENCY STATUS
// =========================================================

router.put(
  "/emergency/:id/status",
  updateEmergencyStatus
);


// =========================================================
// UPDATE ASSISTANCE STATUS
// =========================================================

router.put(
  "/assistance/:id/status",
  updateAssistanceStatus
);


module.exports = router;