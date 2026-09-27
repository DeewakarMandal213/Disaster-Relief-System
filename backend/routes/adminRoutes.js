const express = require("express");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const controller = require("../controllers/adminController");

const router = express.Router();
router.use(protect, authorizeRoles("Admin"));

router.get("/overview", controller.getAdminOverview);
router.get("/map", controller.getMapData);

router.get("/emergencies", controller.getAdminEmergencies);
router.put("/emergencies/:id", controller.updateEmergency);

router.get("/assistance", controller.getAdminAssistance);
router.put("/assistance/:id", controller.updateAssistance);

router.get("/camps", controller.getAdminCamps);
router.post("/camps", controller.createAdminCamp);
router.put("/camps/:id", controller.updateAdminCamp);
router.delete("/camps/:id", controller.deleteAdminCamp);

router.get("/operations", controller.getAdminOperations);
router.post("/operations", controller.createAdminOperation);
router.put("/operations/:id", controller.updateAdminOperation);
router.delete("/operations/:id", controller.deleteAdminOperation);

router.get("/ngos", controller.getUsersByRole("NGO"));
router.get("/volunteers", controller.getUsersByRole("Volunteer"));
router.get("/users", controller.getAdminUsers);
router.put("/users/:id", controller.updateAdminUser);

router.get("/donations", controller.getAdminDonations);
router.put("/donations/:id", controller.updateDonation);

router.get("/distribution", controller.getDistributions);
router.post("/distribution", controller.createDistribution);
router.put("/distribution/:id", controller.updateDistribution);

router.get("/approvals", controller.getApprovals);
router.put("/approvals/:id", controller.updateApproval);

router.get("/reports", controller.getReports);

router.get("/announcements", controller.getAnnouncements);
router.post("/announcements", controller.createAnnouncement);
router.put("/announcements/:id", controller.updateAnnouncement);
router.delete("/announcements/:id", controller.deleteAnnouncement);

router.get("/logs", controller.getActivityLogs);
router.get("/settings", controller.getSettings);
router.put("/settings", controller.updateSetting);

module.exports = router;
