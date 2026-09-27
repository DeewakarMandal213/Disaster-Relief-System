const ReliefCamp = require("../models/ReliefCamp");

// =========================================================
// GET ALL RELIEF CAMPS
// =========================================================

const getReliefCamps = async (req, res) => {
  try {
    const camps = await ReliefCamp.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      camps,
    });
  } catch (error) {
    console.error(
      "Get relief camps error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch relief camps.",
      error: error.message,
    });
  }
};


// =========================================================
// GET ONE RELIEF CAMP
// =========================================================

const getReliefCampById = async (req, res) => {
  try {
    const camp = await ReliefCamp.findById(
      req.params.id
    );

    if (!camp) {
      return res.status(404).json({
        success: false,
        message: "Relief camp not found.",
      });
    }

    res.status(200).json({
      success: true,
      camp,
    });
  } catch (error) {
    console.error(
      "Get relief camp error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch relief camp.",
      error: error.message,
    });
  }
};


// =========================================================
// CREATE RELIEF CAMP
// =========================================================

const createReliefCamp = async (req, res) => {
  try {
    const {
      name,
      location,
      contactNumber,
      capacity,
      occupied,
      facilities,
      status,
      latitude,
      longitude,
      description,
    } = req.body;

    const camp = await ReliefCamp.create({
      name,
      location,
      contactNumber,
      capacity,
      occupied,
      facilities,
      status,
      latitude,
      longitude,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Relief camp created successfully.",
      camp,
    });
  } catch (error) {
    console.error(
      "Create relief camp error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to create relief camp.",
      error: error.message,
    });
  }
};


// =========================================================
// UPDATE RELIEF CAMP
// =========================================================

const updateReliefCamp = async (req, res) => {
  try {
    const camp = await ReliefCamp.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!camp) {
      return res.status(404).json({
        success: false,
        message: "Relief camp not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Relief camp updated successfully.",
      camp,
    });
  } catch (error) {
    console.error(
      "Update relief camp error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update relief camp.",
      error: error.message,
    });
  }
};


// =========================================================
// DELETE RELIEF CAMP
// =========================================================

const deleteReliefCamp = async (req, res) => {
  try {
    const camp = await ReliefCamp.findByIdAndDelete(
      req.params.id
    );

    if (!camp) {
      return res.status(404).json({
        success: false,
        message: "Relief camp not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Relief camp deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete relief camp error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete relief camp.",
      error: error.message,
    });
  }
};


module.exports = {
  getReliefCamps,
  getReliefCampById,
  createReliefCamp,
  updateReliefCamp,
  deleteReliefCamp,
};