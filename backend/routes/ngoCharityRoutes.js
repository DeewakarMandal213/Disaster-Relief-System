const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  contribute,
  getMyContributions,
} = require("../controllers/ngoCharityController");

// Only logged-in NGOs can create/view their own charity contributions.
router.use(protect, authorizeRoles("NGO"));

router.post("/contribute", contribute);
router.get("/my-contributions", getMyContributions);

module.exports = router;
