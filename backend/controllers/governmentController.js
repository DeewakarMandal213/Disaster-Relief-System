const mongoose = require("mongoose");
const User = require("../models/User");
const Emergency = require("../models/Emergency");
const Assistance = require("../models/Assistance");
const Donation = require("../models/Donation");
const ReliefCamp = require("../models/ReliefCamp");
const NGOContribution = require("../models/NGOContribution");
const GovernmentOperation = require("../models/GovernmentOperation");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const getGovernmentDashboard = async (req, res) => {
  try {
    const [
      totalEmergencies,
      pendingEmergencies,
      activeEmergencies,
      criticalEmergencies,
      totalAssistance,
      pendingAssistance,
      activeAssistance,
      volunteers,
      ngos,
      reliefCamps,
      donations,
      donationAmount,
      ngoContributions,
      ngoContributionAmount,
      activeOperations,
      completedEmergencies,
      completedAssistance,
    ] = await Promise.all([
      Emergency.countDocuments(),
      Emergency.countDocuments({ status: "Pending" }),
      Emergency.countDocuments({ status: { $in: ["Acknowledged", "In Progress"] } }),
      Emergency.countDocuments({ severity: "Critical", status: { $nin: ["Resolved", "Rejected"] } }),
      Assistance.countDocuments(),
      Assistance.countDocuments({ status: "Pending" }),
      Assistance.countDocuments({ status: { $in: ["Acknowledged", "In Progress"] } }),
      User.countDocuments({ role: "Volunteer" }),
      User.countDocuments({ role: "NGO" }),
      ReliefCamp.countDocuments(),
      Donation.countDocuments(),
      Donation.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
      NGOContribution.countDocuments(),
      NGOContribution.aggregate([
        { $match: { contributionType: "Money" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      GovernmentOperation.countDocuments({ status: { $in: ["Planned", "In Progress"] } }),
      Emergency.countDocuments({ status: "Resolved" }),
      Assistance.countDocuments({ status: "Fulfilled" }),
    ]);

    const stats = {
      totalEmergencies,
      pendingEmergencies,
      activeEmergencies,
      criticalEmergencies,
      totalAssistance,
      pendingAssistance,
      activeAssistance,
      volunteers,
      ngos,
      reliefCamps,
      donations,
      donationAmount: donationAmount[0]?.total || 0,
      ngoContributions,
      ngoContributionAmount: ngoContributionAmount[0]?.total || 0,
      activeOperations,
      peopleHelped: completedEmergencies + completedAssistance,
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error("Government dashboard error:", error);
    res.status(500).json({ success: false, message: "Failed to load government dashboard." });
  }
};

const getGovernmentEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.find()
      .sort({ createdAt: -1 })
      .populate("user", "fullName email phone address")
      .populate("assignedVolunteer", "fullName email phone")
      .populate("handledByNGO", "fullName email phone")
      .populate("handledByGovernment", "fullName email phone");
    res.json({ success: true, emergencies });
  } catch (error) {
    console.error("Government emergencies error:", error);
    res.status(500).json({ success: false, message: "Failed to load emergencies." });
  }
};

const getGovernmentAssistance = async (req, res) => {
  try {
    const assistance = await Assistance.find()
      .sort({ createdAt: -1 })
      .populate("user", "fullName email phone address")
      .populate("assignedVolunteer", "fullName email phone")
      .populate("handledByNGO", "fullName email phone")
      .populate("handledByGovernment", "fullName email phone");
    res.json({ success: true, assistance });
  } catch (error) {
    console.error("Government assistance error:", error);
    res.status(500).json({ success: false, message: "Failed to load assistance requests." });
  }
};

const getGovernmentNGOs = async (req, res) => {
  try {
    const ngos = await User.find({ role: "NGO" })
      .select("fullName email phone address createdAt")
      .sort({ fullName: 1 });

    const enriched = await Promise.all(
      ngos.map(async (ngo) => {
        const [emergencies, assistance, camps] = await Promise.all([
          Emergency.countDocuments({ handledByNGO: ngo._id, status: { $nin: ["Resolved", "Rejected"] } }),
          Assistance.countDocuments({ handledByNGO: ngo._id, status: { $nin: ["Fulfilled", "Rejected"] } }),
          ReliefCamp.countDocuments({ managedByNGO: ngo._id }),
        ]);
        return { ...ngo.toObject(), activeRequests: emergencies + assistance, camps };
      })
    );

    res.json({ success: true, ngos: enriched });
  } catch (error) {
    console.error("Government NGO error:", error);
    res.status(500).json({ success: false, message: "Failed to load NGOs." });
  }
};

const getGovernmentVolunteers = async (req, res) => {
  try {
    const volunteers = await User.find({ role: "Volunteer" })
      .select("fullName email phone address createdAt")
      .sort({ fullName: 1 });

    const enriched = await Promise.all(
      volunteers.map(async (volunteer) => {
        const [emergencyAssignments, assistanceAssignments] = await Promise.all([
          Emergency.countDocuments({ assignedVolunteer: volunteer._id, status: { $nin: ["Resolved", "Rejected"] } }),
          Assistance.countDocuments({ assignedVolunteer: volunteer._id, status: { $nin: ["Fulfilled", "Rejected"] } }),
        ]);
        return {
          ...volunteer.toObject(),
          activeAssignments: emergencyAssignments + assistanceAssignments,
          available: emergencyAssignments + assistanceAssignments === 0,
        };
      })
    );

    res.json({ success: true, volunteers: enriched });
  } catch (error) {
    console.error("Government volunteer error:", error);
    res.status(500).json({ success: false, message: "Failed to load volunteers." });
  }
};

const getGovernmentCamps = async (req, res) => {
  try {
    const camps = await ReliefCamp.find()
      .sort({ createdAt: -1 })
      .populate("managedByNGO", "fullName email phone")
      .populate("managedByGovernment", "fullName email phone");
    res.json({ success: true, camps });
  } catch (error) {
    console.error("Government camps error:", error);
    res.status(500).json({ success: false, message: "Failed to load relief camps." });
  }
};

const getGovernmentDonations = async (req, res) => {
  try {
    const donations = await Donation.find()
      .sort({ createdAt: -1 })
      .populate("donor", "fullName email phone");
    res.json({ success: true, donations });
  } catch (error) {
    console.error("Government donations error:", error);
    res.status(500).json({ success: false, message: "Failed to load donations." });
  }
};

const getGovernmentNGOContributions = async (req, res) => {
  try {
    const contributions = await NGOContribution.find()
      .sort({ createdAt: -1 })
      .populate("ngo", "fullName email phone");
    res.json({ success: true, contributions });
  } catch (error) {
    console.error("Government NGO contributions error:", error);
    res.status(500).json({ success: false, message: "Failed to load NGO contributions." });
  }
};

const getGovernmentOperations = async (req, res) => {
  try {
    const operations = await GovernmentOperation.find()
      .sort({ createdAt: -1 })
      .populate("governmentOfficer", "fullName email phone")
      .populate("assignedNGO", "fullName email phone")
      .populate("assignedVolunteers", "fullName email phone")
      .populate("reliefCamp", "name location capacity occupied status")
      .populate("emergency")
      .populate("assistance");
    res.json({ success: true, operations });
  } catch (error) {
    console.error("Government operations error:", error);
    res.status(500).json({ success: false, message: "Failed to load government operations." });
  }
};

const takeGovernmentAction = async (req, res, isEmergency) => {
  try {
    const Model = isEmergency ? Emergency : Assistance;
    const record = await Model.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: "Request not found." });

    const closedStatuses = isEmergency ? ["Resolved", "Rejected"] : ["Fulfilled", "Rejected"];
    if (closedStatuses.includes(record.status)) {
      return res.status(400).json({ success: false, message: "This request is already closed." });
    }

    record.handledByGovernment = req.user._id;
    record.status = "In Progress";
    await record.save();

    const operation = await GovernmentOperation.create({
      governmentOfficer: req.user._id,
      title: isEmergency ? `${record.emergencyType} Government Response` : `${record.assistanceType} Government Assistance`,
      operationType: "Direct Assistance",
      emergency: isEmergency ? record._id : null,
      assistance: isEmergency ? null : record._id,
      location: record.location,
      description: record.description || "Government directly handling this request.",
      status: "In Progress",
    });

    res.json({ success: true, message: "Government action started successfully.", record, operation });
  } catch (error) {
    console.error("Government direct action error:", error);
    res.status(500).json({ success: false, message: "Failed to start government action." });
  }
};

const handleGovernmentEmergency = (req, res) => takeGovernmentAction(req, res, true);
const handleGovernmentAssistance = (req, res) => takeGovernmentAction(req, res, false);

const assignNGOToEmergency = async (req, res, isEmergency) => {
  try {
    const { ngoId } = req.body;
    if (!isValidId(ngoId)) return res.status(400).json({ success: false, message: "Valid NGO is required." });
    const ngo = await User.findOne({ _id: ngoId, role: "NGO" });
    if (!ngo) return res.status(404).json({ success: false, message: "NGO not found." });

    const Model = isEmergency ? Emergency : Assistance;
    const record = await Model.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: "Request not found." });

    record.handledByNGO = ngo._id;
    record.status = "Acknowledged";
    await record.save();

    const operation = await GovernmentOperation.create({
      governmentOfficer: req.user._id,
      title: isEmergency ? "NGO Emergency Coordination" : "NGO Assistance Coordination",
      operationType: "NGO Coordination",
      emergency: isEmergency ? record._id : null,
      assistance: isEmergency ? null : record._id,
      assignedNGO: ngo._id,
      location: record.location,
      description: `Government assigned ${ngo.fullName} to coordinate this request.`,
      status: "In Progress",
    });

    res.json({ success: true, message: "NGO assigned successfully.", record, operation });
  } catch (error) {
    console.error("Government NGO assignment error:", error);
    res.status(500).json({ success: false, message: "Failed to assign NGO." });
  }
};

const assignNGOToEmergencyRequest = (req, res) => assignNGOToEmergency(req, res, true);
const assignNGOToAssistanceRequest = (req, res) => assignNGOToEmergency(req, res, false);

const assignVolunteerToRequest = async (req, res, isEmergency) => {
  try {
    const { volunteerId } = req.body;
    if (!isValidId(volunteerId)) return res.status(400).json({ success: false, message: "Valid volunteer is required." });
    const volunteer = await User.findOne({ _id: volunteerId, role: "Volunteer" });
    if (!volunteer) return res.status(404).json({ success: false, message: "Volunteer not found." });

    const Model = isEmergency ? Emergency : Assistance;
    const record = await Model.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: "Request not found." });

    record.assignedVolunteer = volunteer._id;
    record.status = "Acknowledged";
    await record.save();

    const operation = await GovernmentOperation.create({
      governmentOfficer: req.user._id,
      title: isEmergency ? "Government Volunteer Deployment" : "Government Volunteer Assistance",
      operationType: "Volunteer Deployment",
      emergency: isEmergency ? record._id : null,
      assistance: isEmergency ? null : record._id,
      assignedVolunteers: [volunteer._id],
      location: record.location,
      description: `Government coordinated ${volunteer.fullName} for this request.`,
      status: "In Progress",
    });

    res.json({ success: true, message: "Volunteer assigned successfully.", record, operation });
  } catch (error) {
    console.error("Government volunteer assignment error:", error);
    res.status(500).json({ success: false, message: "Failed to assign volunteer." });
  }
};

const assignVolunteerToEmergency = (req, res) => assignVolunteerToRequest(req, res, true);
const assignVolunteerToAssistance = (req, res) => assignVolunteerToRequest(req, res, false);

const createGovernmentOperation = async (req, res) => {
  try {
    const {
      title,
      operationType,
      emergency,
      assistance,
      assignedNGO,
      assignedVolunteers,
      reliefCamp,
      resources,
      affectedPeople,
      location,
      description,
      status,
    } = req.body;

    if (!title || !operationType) {
      return res.status(400).json({ success: false, message: "Title and operation type are required." });
    }

    const operation = await GovernmentOperation.create({
      governmentOfficer: req.user._id,
      title,
      operationType,
      emergency: isValidId(emergency) ? emergency : null,
      assistance: isValidId(assistance) ? assistance : null,
      assignedNGO: isValidId(assignedNGO) ? assignedNGO : null,
      assignedVolunteers: Array.isArray(assignedVolunteers) ? assignedVolunteers.filter(isValidId) : [],
      reliefCamp: isValidId(reliefCamp) ? reliefCamp : null,
      resources: Array.isArray(resources) ? resources : [],
      affectedPeople: Number(affectedPeople) || 0,
      location: location || "",
      description: description || "",
      status: status || "Planned",
    });

    const populated = await GovernmentOperation.findById(operation._id)
      .populate("assignedNGO", "fullName email phone")
      .populate("assignedVolunteers", "fullName email phone")
      .populate("reliefCamp", "name location capacity occupied status");

    res.status(201).json({ success: true, message: "Government operation created.", operation: populated });
  } catch (error) {
    console.error("Create government operation error:", error);
    res.status(500).json({ success: false, message: "Failed to create government operation." });
  }
};

const updateGovernmentOperation = async (req, res) => {
  try {
    const operation = await GovernmentOperation.findById(req.params.id);
    if (!operation) return res.status(404).json({ success: false, message: "Government operation not found." });

    const allowed = ["Planned", "In Progress", "Completed", "Cancelled"];
    if (req.body.status && !allowed.includes(req.body.status)) {
      return res.status(400).json({ success: false, message: "Invalid operation status." });
    }

    const fields = ["title", "operationType", "assignedNGO", "assignedVolunteers", "reliefCamp", "resources", "affectedPeople", "location", "description", "status"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) operation[field] = req.body[field];
    });

    await operation.save();
    res.json({ success: true, message: "Government operation updated.", operation });
  } catch (error) {
    console.error("Update government operation error:", error);
    res.status(500).json({ success: false, message: "Failed to update government operation." });
  }
};

const createGovernmentCamp = async (req, res) => {
  try {
    const { name, location, contactNumber, capacity, occupied, facilities, status, latitude, longitude, description } = req.body;
    if (!name || !location || capacity === undefined) {
      return res.status(400).json({ success: false, message: "Camp name, location and capacity are required." });
    }
    const cap = Number(capacity);
    const occ = Number(occupied || 0);
    if (Number.isNaN(cap) || cap < 0 || Number.isNaN(occ) || occ < 0 || occ > cap) {
      return res.status(400).json({ success: false, message: "Occupancy must be between 0 and the camp capacity." });
    }

    const camp = await ReliefCamp.create({
      managedByGovernment: req.user._id,
      name,
      location,
      contactNumber,
      capacity: cap,
      occupied: occ,
      facilities: Array.isArray(facilities) ? facilities : [],
      status: status || (occ >= cap ? "Full" : occ >= cap * 0.8 ? "Limited Capacity" : "Open"),
      latitude,
      longitude,
      description,
    });
    res.status(201).json({ success: true, message: "Government relief camp created.", camp });
  } catch (error) {
    console.error("Create government camp error:", error);
    res.status(500).json({ success: false, message: "Failed to create government relief camp." });
  }
};

const updateGovernmentCamp = async (req, res) => {
  try {
    const camp = await ReliefCamp.findOne({ _id: req.params.id, managedByGovernment: req.user._id });
    if (!camp) return res.status(404).json({ success: false, message: "Government-owned camp not found." });

    const nextCapacity = req.body.capacity !== undefined ? Number(req.body.capacity) : camp.capacity;
    const nextOccupied = req.body.occupied !== undefined ? Number(req.body.occupied) : camp.occupied;
    if (Number.isNaN(nextCapacity) || Number.isNaN(nextOccupied) || nextCapacity < 0 || nextOccupied < 0 || nextOccupied > nextCapacity) {
      return res.status(400).json({ success: false, message: "Occupancy must be between 0 and capacity." });
    }

    ["name", "location", "contactNumber", "facilities", "status", "latitude", "longitude", "description"].forEach((field) => {
      if (req.body[field] !== undefined) camp[field] = req.body[field];
    });
    camp.capacity = nextCapacity;
    camp.occupied = nextOccupied;
    if (req.body.status === undefined) {
      camp.status = nextOccupied >= nextCapacity ? "Full" : nextOccupied >= nextCapacity * 0.8 ? "Limited Capacity" : "Open";
    }
    await camp.save();
    res.json({ success: true, message: "Government camp updated.", camp });
  } catch (error) {
    console.error("Update government camp error:", error);
    res.status(500).json({ success: false, message: "Failed to update government camp." });
  }
};

const deleteGovernmentCamp = async (req, res) => {
  try {
    const camp = await ReliefCamp.findOneAndDelete({ _id: req.params.id, managedByGovernment: req.user._id });
    if (!camp) return res.status(404).json({ success: false, message: "Government-owned camp not found." });
    res.json({ success: true, message: "Government camp deleted." });
  } catch (error) {
    console.error("Delete government camp error:", error);
    res.status(500).json({ success: false, message: "Failed to delete government camp." });
  }
};

const getGovernmentReport = async (req, res) => {
  try {
    const [emergencyByStatus, assistanceByStatus, operationsByStatus, camps] = await Promise.all([
      Emergency.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Assistance.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      GovernmentOperation.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      ReliefCamp.aggregate([{ $group: { _id: null, capacity: { $sum: "$capacity" }, occupied: { $sum: "$occupied" } } }]),
    ]);
    res.json({
      success: true,
      report: {
        emergencyByStatus,
        assistanceByStatus,
        operationsByStatus,
        campCapacity: camps[0]?.capacity || 0,
        campOccupied: camps[0]?.occupied || 0,
      },
    });
  } catch (error) {
    console.error("Government report error:", error);
    res.status(500).json({ success: false, message: "Failed to generate government report." });
  }
};

module.exports = {
  getGovernmentDashboard,
  getGovernmentEmergencies,
  getGovernmentAssistance,
  getGovernmentNGOs,
  getGovernmentVolunteers,
  getGovernmentCamps,
  getGovernmentDonations,
  getGovernmentNGOContributions,
  getGovernmentOperations,
  handleGovernmentEmergency,
  handleGovernmentAssistance,
  assignNGOToEmergencyRequest,
  assignNGOToAssistanceRequest,
  assignVolunteerToEmergency,
  assignVolunteerToAssistance,
  createGovernmentOperation,
  updateGovernmentOperation,
  createGovernmentCamp,
  updateGovernmentCamp,
  deleteGovernmentCamp,
  getGovernmentReport,
};
