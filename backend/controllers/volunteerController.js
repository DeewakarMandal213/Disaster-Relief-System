const Emergency = require("../models/Emergency");
const Assistance = require("../models/Assistance");

// =========================================================
// GET VOLUNTEER REQUESTS
// Returns unassigned active emergency + assistance requests
// =========================================================

const getVolunteerRequests = async (req, res) => {
  try {
    const emergencies = await Emergency.find({
      assignedVolunteer: null,
      status: {
        $in: [
          "Pending",
          "Acknowledged",
          "In Progress",
        ],
      },
    })
      .populate("user", "fullName email phone")
      .sort({ createdAt: -1 });

    const assistances = await Assistance.find({
      assignedVolunteer: null,
      status: {
        $in: [
          "Pending",
          "Acknowledged",
          "In Progress",
        ],
      },
    })
      .populate("user", "fullName email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      emergencies,
      assistances,
    });
  } catch (error) {
    console.error(
      "Get volunteer requests error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch volunteer requests.",
      error: error.message,
    });
  }
};


// =========================================================
// GET MY ASSIGNED REQUESTS
// =========================================================

const getMyVolunteerRequests = async (req, res) => {
  try {
    const emergencies = await Emergency.find({
      assignedVolunteer: req.user._id,
    })
      .populate("user", "fullName email phone")
      .sort({ createdAt: -1 });

    const assistances = await Assistance.find({
      assignedVolunteer: req.user._id,
    })
      .populate("user", "fullName email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      emergencies,
      assistances,
    });
  } catch (error) {
    console.error(
      "Get my volunteer requests error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch your assigned requests.",
      error: error.message,
    });
  }
};


// =========================================================
// ACCEPT EMERGENCY REQUEST
// =========================================================

const acceptEmergency = async (req, res) => {
  try {
    const emergency = await Emergency.findOneAndUpdate(
      {
        _id: req.params.id,
        assignedVolunteer: null,
        status: {
          $in: ["Pending", "Acknowledged"],
        },
      },
      {
        assignedVolunteer: req.user._id,
        status: "In Progress",
      },
      {
        new: true,
      }
    ).populate("user", "fullName email phone");

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message:
          "Emergency is no longer available or has already been assigned.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Emergency request accepted successfully.",
      emergency,
    });
  } catch (error) {
    console.error(
      "Accept emergency error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to accept emergency request.",
      error: error.message,
    });
  }
};


// =========================================================
// ACCEPT ASSISTANCE REQUEST
// =========================================================

const acceptAssistance = async (req, res) => {
  try {
    const assistance = await Assistance.findOneAndUpdate(
      {
        _id: req.params.id,
        assignedVolunteer: null,
        status: {
          $in: ["Pending", "Acknowledged"],
        },
      },
      {
        assignedVolunteer: req.user._id,
        status: "In Progress",
      },
      {
        new: true,
      }
    ).populate("user", "fullName email phone");

    if (!assistance) {
      return res.status(404).json({
        success: false,
        message:
          "Assistance request is no longer available or has already been assigned.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Assistance request accepted successfully.",
      assistance,
    });
  } catch (error) {
    console.error(
      "Accept assistance error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to accept assistance request.",
      error: error.message,
    });
  }
};


// =========================================================
// UPDATE EMERGENCY STATUS
// =========================================================

const updateEmergencyStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "In Progress",
      "Resolved",
      "Rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid emergency status.",
      });
    }

    const emergency = await Emergency.findOneAndUpdate(
      {
        _id: req.params.id,
        assignedVolunteer: req.user._id,
      },
      {
        status,
      },
      {
        new: true,
      }
    ).populate("user", "fullName email phone");

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message:
          "Emergency request not found or not assigned to you.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Emergency status updated successfully.",
      emergency,
    });
  } catch (error) {
    console.error(
      "Update emergency status error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update emergency status.",
      error: error.message,
    });
  }
};


// =========================================================
// UPDATE ASSISTANCE STATUS
// =========================================================

const updateAssistanceStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "In Progress",
      "Fulfilled",
      "Rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assistance status.",
      });
    }

    const assistance = await Assistance.findOneAndUpdate(
      {
        _id: req.params.id,
        assignedVolunteer: req.user._id,
      },
      {
        status,
      },
      {
        new: true,
      }
    ).populate("user", "fullName email phone");

    if (!assistance) {
      return res.status(404).json({
        success: false,
        message:
          "Assistance request not found or not assigned to you.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Assistance status updated successfully.",
      assistance,
    });
  } catch (error) {
    console.error(
      "Update assistance status error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update assistance status.",
      error: error.message,
    });
  }
};


// =========================================================
// EXPORT
// =========================================================

module.exports = {
  getVolunteerRequests,
  getMyVolunteerRequests,
  acceptEmergency,
  acceptAssistance,
  updateEmergencyStatus,
  updateAssistanceStatus,
};