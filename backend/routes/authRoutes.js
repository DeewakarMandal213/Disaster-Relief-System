const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
} = require("../controllers/authController");


// =========================================================
// AUTHENTICATION
// =========================================================

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// =========================================================
// USER PROFILE
// =========================================================

// Get logged-in user's profile
router.get("/profile", protect, getProfile);

// Update logged-in user's profile
router.put("/profile", protect, updateProfile);
router.put(
  "/change-password",
  protect,
  changePassword
);

// =========================================================
// ROLE-SPECIFIC ROUTES
// =========================================================

// Citizen
router.get(
  "/citizen",
  protect,
  authorizeRoles("Citizen"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome Citizen",
      user: req.user,
    });
  }
);


// Volunteer
router.get(
  "/volunteer",
  protect,
  authorizeRoles("Volunteer"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome Volunteer",
      user: req.user,
    });
  }
);


// Donor
router.get(
  "/donor",
  protect,
  authorizeRoles("Donor"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome Donor",
      user: req.user,
    });
  }
);


// NGO
router.get(
  "/ngo",
  protect,
  authorizeRoles("NGO"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome NGO",
      user: req.user,
    });
  }
);


// Government
router.get(
  "/government",
  protect,
  authorizeRoles("Government"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome Government",
      user: req.user,
    });
  }
);


// Admin
router.get(
  "/admin",
  protect,
  authorizeRoles("Admin"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome Admin",
      user: req.user,
    });
  }
);


module.exports = router;