const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  registerUser,
  loginUser,
} = require("../controllers/authController");

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

router.get(
    "/citizen",
    protect,
    authorizeRoles("Citizen"),
    (req, res) => {
        res.json({
            success: true,
            message: "Welcome Citizen",
            user: req.user
        });
    }
);

router.get(
    "/volunteer",
    protect,
    authorizeRoles("Volunteer"),
    (req, res) => {
        res.json({
            success: true,
            message: "Welcome Volunteer",
            user: req.user
        });
    }
);

router.get(
    "/donor",
    protect,
    authorizeRoles("Donor"),
    (req, res) => {
        res.json({
            success: true,
            message: "Welcome Donor",
            user: req.user
        });
    }
);

router.get(
    "/ngo",
    protect,
    authorizeRoles("NGO"),
    (req, res) => {
        res.json({
            success: true,
            message: "Welcome NGO",
            user: req.user
        });
    }
);

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

router.get("/profile", protect, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

module.exports = router;