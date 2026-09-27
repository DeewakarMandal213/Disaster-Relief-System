const Emergency = require("../models/Emergency");
const Assistance = require("../models/Assistance");
const Donation = require("../models/Donation");
const ReliefCamp = require("../models/ReliefCamp");
const User = require("../models/User");

const getNgoDashboard = async (req, res) => {
  try {
    const ngoId = req.user._id;

    const [
      pendingEmergencies,
      pendingAssistance,
      activeEmergencies,
      activeAssistance,
      handledEmergencies,
      handledAssistance,
      volunteers,
      donations,
      reliefCamps,
    ] = await Promise.all([
      Emergency.countDocuments({ status: "Pending" }),
      Assistance.countDocuments({ status: "Pending" }),
      Emergency.countDocuments({ handledByNGO: ngoId, status: { $in: ["Acknowledged", "In Progress"] } }),
      Assistance.countDocuments({ handledByNGO: ngoId, status: { $in: ["Acknowledged", "In Progress"] } }),
      Emergency.countDocuments({ handledByNGO: ngoId, status: "Resolved" }),
      Assistance.countDocuments({ handledByNGO: ngoId, status: "Fulfilled" }),
      User.countDocuments({ role: "Volunteer" }),
      Donation.countDocuments({}),
      ReliefCamp.countDocuments({}),
    ]);

    const stats = {
      pendingEmergencies,
      pendingAssistance,
      activeRequests: activeEmergencies + activeAssistance,
      handledRequests: handledEmergencies + handledAssistance,
      volunteers,
      donations,
      reliefCamps,
    };

    res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error("NGO dashboard error:", error);
    res.status(500).json({ success: false, message: "Failed to load NGO dashboard." });
  }
};

const getNgoRequests = async (req, res) => {
  try {
    const [emergencies, assistance] = await Promise.all([
      Emergency.find()
        .sort({ createdAt: -1 })
        .populate("user", "fullName email phone")
        .populate("assignedVolunteer", "fullName email phone")
        .populate("handledByNGO", "fullName email"),
      Assistance.find()
        .sort({ createdAt: -1 })
        .populate("user", "fullName email phone")
        .populate("assignedVolunteer", "fullName email phone")
        .populate("handledByNGO", "fullName email"),
    ]);

    res.status(200).json({ success: true, emergencies, assistance });
  } catch (error) {
    console.error("NGO requests error:", error);
    res.status(500).json({ success: false, message: "Failed to load help requests." });
  }
};

const getNgoVolunteers = async (req, res) => {
  try {
    const volunteers = await User.find({ role: "Volunteer" })
      .select("fullName email phone address")
      .sort({ fullName: 1 });

    res.status(200).json({ success: true, volunteers });
  } catch (error) {
    console.error("NGO volunteers error:", error);
    res.status(500).json({ success: false, message: "Failed to load volunteers." });
  }
};

const assignVolunteerToEmergency = async (req, res) => {
  try {
    const { volunteerId } = req.body;
    if (!volunteerId) return res.status(400).json({ success: false, message: "Volunteer is required." });

    const volunteer = await User.findOne({ _id: volunteerId, role: "Volunteer" });
    if (!volunteer) return res.status(404).json({ success: false, message: "Volunteer not found." });

    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) return res.status(404).json({ success: false, message: "Emergency request not found." });
    if (["Resolved", "Rejected"].includes(emergency.status)) return res.status(400).json({ success: false, message: "Completed requests cannot be assigned." });

    emergency.assignedVolunteer = volunteer._id;
    emergency.handledByNGO = req.user._id;
    emergency.status = "Acknowledged";
    await emergency.save();

    const updated = await Emergency.findById(emergency._id).populate("assignedVolunteer", "fullName email phone");
    res.status(200).json({ success: true, message: "Volunteer assigned successfully.", emergency: updated });
  } catch (error) {
    console.error("Assign NGO emergency volunteer error:", error);
    res.status(500).json({ success: false, message: "Failed to assign volunteer." });
  }
};

const assignVolunteerToAssistance = async (req, res) => {
  try {
    const { volunteerId } = req.body;
    if (!volunteerId) return res.status(400).json({ success: false, message: "Volunteer is required." });

    const volunteer = await User.findOne({ _id: volunteerId, role: "Volunteer" });
    if (!volunteer) return res.status(404).json({ success: false, message: "Volunteer not found." });

    const assistance = await Assistance.findById(req.params.id);
    if (!assistance) return res.status(404).json({ success: false, message: "Assistance request not found." });
    if (["Fulfilled", "Rejected"].includes(assistance.status)) return res.status(400).json({ success: false, message: "Completed requests cannot be assigned." });

    assistance.assignedVolunteer = volunteer._id;
    assistance.handledByNGO = req.user._id;
    assistance.status = "Acknowledged";
    await assistance.save();

    const updated = await Assistance.findById(assistance._id).populate("assignedVolunteer", "fullName email phone");
    res.status(200).json({ success: true, message: "Volunteer assigned successfully.", assistance: updated });
  } catch (error) {
    console.error("Assign NGO assistance volunteer error:", error);
    res.status(500).json({ success: false, message: "Failed to assign volunteer." });
  }
};

const updateNgoEmergencyStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Acknowledged", "In Progress", "Resolved", "Rejected"];
    if (!allowed.includes(status)) return res.status(400).json({ success: false, message: "Invalid emergency status." });

    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) return res.status(404).json({ success: false, message: "Emergency request not found." });
    if (["Resolved", "Rejected"].includes(emergency.status) && emergency.status !== status) return res.status(400).json({ success: false, message: "This emergency is already closed." });

    if (status !== "Rejected") emergency.handledByNGO = req.user._id;
    emergency.status = status;
    await emergency.save();

    res.status(200).json({ success: true, message: `Emergency status changed to ${status}.`, emergency });
  } catch (error) {
    console.error("Update NGO emergency status error:", error);
    res.status(500).json({ success: false, message: "Failed to update emergency status." });
  }
};

const updateNgoAssistanceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Acknowledged", "In Progress", "Fulfilled", "Rejected"];
    if (!allowed.includes(status)) return res.status(400).json({ success: false, message: "Invalid assistance status." });

    const assistance = await Assistance.findById(req.params.id);
    if (!assistance) return res.status(404).json({ success: false, message: "Assistance request not found." });
    if (["Fulfilled", "Rejected"].includes(assistance.status) && assistance.status !== status) return res.status(400).json({ success: false, message: "This assistance request is already closed." });

    if (status !== "Rejected") assistance.handledByNGO = req.user._id;
    assistance.status = status;
    await assistance.save();

    res.status(200).json({ success: true, message: `Assistance status changed to ${status}.`, assistance });
  } catch (error) {
    console.error("Update NGO assistance status error:", error);
    res.status(500).json({ success: false, message: "Failed to update assistance status." });
  }
};

const getNgoDonations = async (req, res) => {
  try {
    const donations = await Donation.find()
      .sort({ createdAt: -1 })
      .populate("donor", "fullName email phone");
    res.status(200).json({ success: true, donations });
  } catch (error) {
    console.error("NGO donations error:", error);
    res.status(500).json({ success: false, message: "Failed to load donations." });
  }
};

const updateDonationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Recorded", "Verified", "Used"].includes(status)) return res.status(400).json({ success: false, message: "Invalid donation status." });

    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ success: false, message: "Donation not found." });
    donation.status = status;
    await donation.save();

    res.status(200).json({ success: true, message: `Donation marked as ${status}.`, donation });
  } catch (error) {
    console.error("Update NGO donation error:", error);
    res.status(500).json({ success: false, message: "Failed to update donation." });
  }
};

module.exports = {
  getNgoDashboard,
  getNgoRequests,
  getNgoVolunteers,
  assignVolunteerToEmergency,
  assignVolunteerToAssistance,
  updateNgoEmergencyStatus,
  updateNgoAssistanceStatus,
  getNgoDonations,
  updateDonationStatus,
};
