const User = require("../models/User");
const Emergency = require("../models/Emergency");
const Assistance = require("../models/Assistance");
const ReliefCamp = require("../models/ReliefCamp");

// =========================================================
// GET CITIZEN DASHBOARD STATISTICS
// =========================================================

const getCitizenDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // =======================================================
    // FETCH CITIZEN'S REQUESTS
    // =======================================================

    const [myEmergencies, myAssistances] =
      await Promise.all([
        Emergency.find({
          user: userId,
        }).sort({ createdAt: -1 }),

        Assistance.find({
          user: userId,
        }).sort({ createdAt: -1 }),
      ]);

    // =======================================================
    // TOTAL REQUESTS
    // =======================================================

    const totalRequests =
      myEmergencies.length +
      myAssistances.length;

    // =======================================================
    // ACTIVE REQUESTS
    // =======================================================

    const inactiveStatuses = [
      "Resolved",
      "Fulfilled",
      "Rejected",
    ];

    const activeEmergencies =
      myEmergencies.filter(
        (emergency) =>
          !inactiveStatuses.includes(
            emergency.status
          )
      );

    const activeAssistances =
      myAssistances.filter(
        (assistance) =>
          !inactiveStatuses.includes(
            assistance.status
          )
      );

    const activeRequests =
      activeEmergencies.length +
      activeAssistances.length;

    // =======================================================
    // TOTAL VOLUNTEERS
    // =======================================================

    const nearbyVolunteers =
      await User.countDocuments({
        role: "Volunteer",
      });

    // =======================================================
    // TOTAL RELIEF CAMPS
    // =======================================================

    const reliefCamps =
      await ReliefCamp.countDocuments();

    // =======================================================
    // ACTIVE ALERTS
    //
    // There is currently no separate Alert model.
    // Therefore active emergency reports are counted as
    // active alerts for the Citizen Dashboard.
    // =======================================================

    const activeAlerts =
      await Emergency.countDocuments({
        status: {
          $nin: [
            "Resolved",
            "Rejected",
          ],
        },
      });

    // =======================================================
    // RECENT REQUESTS
    // =======================================================

    const recentEmergencyRequests =
      myEmergencies
        .slice(0, 5)
        .map((emergency) => ({
          _id: emergency._id,
          type: "Emergency",
          title: emergency.emergencyType,
          status: emergency.status,
          priority: emergency.severity,
          location: emergency.location,
          createdAt: emergency.createdAt,
        }));

    const recentAssistanceRequests =
      myAssistances
        .slice(0, 5)
        .map((assistance) => ({
          _id: assistance._id,
          type: "Assistance",
          title: assistance.assistanceType,
          status: assistance.status,
          priority: assistance.priority,
          location: assistance.location,
          createdAt: assistance.createdAt,
        }));

    const recentRequests = [
      ...recentEmergencyRequests,
      ...recentAssistanceRequests,
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      )
      .slice(0, 3);

    // =======================================================
    // RESPONSE
    // =======================================================

    res.status(200).json({
      success: true,

      stats: {
        totalRequests,
        activeRequests,
        nearbyVolunteers,
        reliefCamps,
        volunteers: nearbyVolunteers,
        activeAlerts,
      },

      recentRequests,

      requests: {
        emergencies: myEmergencies,
        assistances: myAssistances,
      },
    });
  } catch (error) {
    console.error(
      "Citizen dashboard stats error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to load citizen dashboard statistics.",
      error: error.message,
    });
  }
};

module.exports = {
  getCitizenDashboardStats,
};