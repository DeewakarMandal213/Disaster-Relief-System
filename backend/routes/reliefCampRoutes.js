const express = require("express");

const {
  getReliefCamps,
  getReliefCampById,
  createReliefCamp,
  updateReliefCamp,
  deleteReliefCamp,
} = require("../controllers/reliefCampController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Public read-only access for citizens and other visitors.
router.get("/", getReliefCamps);
router.get("/:id", getReliefCampById);

// Camp management is restricted to operational roles.
router.post("/", protect, authorizeRoles("Admin"), createReliefCamp);
router.put("/:id", protect, authorizeRoles("Admin"), updateReliefCamp);
router.delete("/:id", protect, authorizeRoles("Admin"), deleteReliefCamp);

module.exports = router;
