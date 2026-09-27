const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  getNgoDashboard,
  getNgoRequests,
  getNgoVolunteers,
  assignVolunteerToEmergency,
  assignVolunteerToAssistance,
  updateNgoEmergencyStatus,
  updateNgoAssistanceStatus,
  getNgoDonations,
  updateDonationStatus,
} = require("../controllers/ngoController");

const {
  getNgoCamps,
  createNgoCamp,
  updateNgoCamp,
  deleteNgoCamp,
} = require("../controllers/ngoCampController");

router.use(protect, authorizeRoles("NGO"));

router.get("/dashboard", getNgoDashboard);
router.get("/requests", getNgoRequests);
router.get("/volunteers", getNgoVolunteers);
router.put("/emergency/:id/assign", assignVolunteerToEmergency);
router.put("/assistance/:id/assign", assignVolunteerToAssistance);
router.put("/emergency/:id/status", updateNgoEmergencyStatus);
router.put("/assistance/:id/status", updateNgoAssistanceStatus);
router.get("/donations", getNgoDonations);
router.put("/donations/:id/status", updateDonationStatus);

router.get("/camps", getNgoCamps);
router.post("/camps", createNgoCamp);
router.put("/camps/:id", updateNgoCamp);
router.delete("/camps/:id", deleteNgoCamp);

module.exports = router;
