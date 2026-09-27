const express = require("express");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  getGovernmentDashboard,
  getGovernmentEmergencies,
  getGovernmentAssistance,
  getGovernmentNGOs,
  getGovernmentVolunteers,
  getGovernmentCamps,
  getGovernmentDonations,
  getGovernmentNGOContributions,
  getGovernmentOperations,
  handleGovernmentEmergency,
  handleGovernmentAssistance,
  assignNGOToEmergencyRequest,
  assignNGOToAssistanceRequest,
  assignVolunteerToEmergency,
  assignVolunteerToAssistance,
  createGovernmentOperation,
  updateGovernmentOperation,
  createGovernmentCamp,
  updateGovernmentCamp,
  deleteGovernmentCamp,
  getGovernmentReport,
} = require("../controllers/governmentController");

const router = express.Router();

router.use(protect, authorizeRoles("Government"));

router.get("/dashboard", getGovernmentDashboard);
router.get("/emergencies", getGovernmentEmergencies);
router.get("/assistance", getGovernmentAssistance);
router.get("/ngos", getGovernmentNGOs);
router.get("/volunteers", getGovernmentVolunteers);
router.get("/camps", getGovernmentCamps);
router.get("/donations", getGovernmentDonations);
router.get("/ngo-contributions", getGovernmentNGOContributions);
router.get("/operations", getGovernmentOperations);
router.get("/reports", getGovernmentReport);

router.put("/emergency/:id/take-action", handleGovernmentEmergency);
router.put("/assistance/:id/take-action", handleGovernmentAssistance);
router.put("/emergency/:id/assign-ngo", assignNGOToEmergencyRequest);
router.put("/assistance/:id/assign-ngo", assignNGOToAssistanceRequest);
router.put("/emergency/:id/assign-volunteer", assignVolunteerToEmergency);
router.put("/assistance/:id/assign-volunteer", assignVolunteerToAssistance);

router.post("/operations", createGovernmentOperation);
router.put("/operations/:id", updateGovernmentOperation);

router.post("/camps", createGovernmentCamp);
router.put("/camps/:id", updateGovernmentCamp);
router.delete("/camps/:id", deleteGovernmentCamp);

module.exports = router;
