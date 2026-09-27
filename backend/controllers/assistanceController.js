const Assistance = require("../models/Assistance");

// =========================================================
// CREATE ASSISTANCE REQUEST
// =========================================================

const createAssistance = async (req, res) => {
  try {
    const {
      assistanceType,
      priority,
      location,
      latitude,
      longitude,
      contactNumber,
      description,
    } = req.body;

    const assistance = await Assistance.create({
      user: req.user._id,
      assistanceType,
      priority,
      location,
      latitude,
      longitude,
      contactNumber,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Assistance request submitted successfully.",
      assistance,
    });
  } catch (error) {
    console.error(
      "Create assistance error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to submit assistance request.",
      error: error.message,
    });
  }
};


// =========================================================
// GET ALL ASSISTANCE REQUESTS
// =========================================================

const getAssistances = async (req, res) => {
  try {
    const assistances = await Assistance.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      assistances,
    });
  } catch (error) {
    console.error(
      "Get assistance requests error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch assistance requests.",
      error: error.message,
    });
  }
};


// =========================================================
// GET LOGGED-IN USER'S ASSISTANCE REQUESTS
// =========================================================

const getMyAssistances = async (req, res) => {
  try {
    const assistances = await Assistance.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      assistances,
    });
  } catch (error) {
    console.error(
      "Get my assistance requests error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch your assistance requests.",
      error: error.message,
    });
  }
};


module.exports = {
  createAssistance,
  getAssistances,
  getMyAssistances,
};