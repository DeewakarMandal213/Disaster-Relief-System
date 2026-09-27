const Emergency = require("../models/Emergency");


// =========================================================
// CREATE EMERGENCY
// =========================================================

const createEmergency = async (req, res) => {
  try {
    const {
      emergencyType,
      severity,
      location,
      latitude,
      longitude,
      contactNumber,
      description,
    } = req.body;

    const emergency = await Emergency.create({
      user: req.user._id,

      emergencyType,

      severity,

      location,

      latitude,

      longitude,

      contactNumber,

      description,
    });

    res.status(201).json({
      success: true,

      message:
        "Emergency report submitted successfully.",

      emergency,
    });
  } catch (error) {
    console.error(
      "Create emergency error:",
      error
    );

    res.status(500).json({
      success: false,

      message:
        "Failed to submit emergency report.",

      error: error.message,
    });
  }
};


// =========================================================
// GET ALL EMERGENCIES
// =========================================================

const getEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.find()
      .populate(
        "user",
        "name email"
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,

      emergencies,
    });
  } catch (error) {
    console.error(
      "Get emergencies error:",
      error
    );

    res.status(500).json({
      success: false,

      message:
        "Failed to fetch emergency reports.",

      error: error.message,
    });
  }
};


// =========================================================
// GET CURRENT USER'S EMERGENCIES
// =========================================================

const getMyEmergencies = async (req, res) => {
  try {
    const emergencies =
      await Emergency.find({
        user: req.user._id,
      }).sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,

      emergencies,
    });
  } catch (error) {
    console.error(
      "Get my emergencies error:",
      error
    );

    res.status(500).json({
      success: false,

      message:
        "Failed to fetch your emergency reports.",

      error: error.message,
    });
  }
};


// =========================================================
// EXPORT CONTROLLERS
// =========================================================

module.exports = {
  createEmergency,
  getEmergencies,
  getMyEmergencies,
};