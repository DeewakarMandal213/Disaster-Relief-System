const mongoose = require("mongoose");
const Emergency = require("../models/Emergency");
const Assistance = require("../models/Assistance");
const ReliefCamp = require("../models/ReliefCamp");
const GovernmentOperation = require("../models/GovernmentOperation");
const Donation = require("../models/Donation");
const NGOContribution = require("../models/NGOContribution");
const User = require("../models/User");
const ReliefDistribution = require("../models/ReliefDistribution");
const Announcement = require("../models/Announcement");
const ActivityLog = require("../models/ActivityLog");
const SystemSetting = require("../models/SystemSetting");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const activeStatuses = ["Pending", "Acknowledged", "In Progress", "Planned"];

const log = async (req, action, module, description, targetId = null, metadata = {}) => {
  try {
    await ActivityLog.create({ action, module, description, performedBy: req.user?._id || null, targetId, metadata });
  } catch (error) {
    console.error("Admin activity log error:", error.message);
  }
};

const populateRequest = (query) =>
  query
    .populate("user", "fullName email phone address role")
    .populate("handledByNGO", "fullName email phone")
    .populate("handledByGovernment", "fullName email phone")
    .populate("assignedVolunteer", "fullName email phone");

const getAdminOverview = async (req, res) => {
  try {
    const [
      emergencies,
      assistance,
      camps,
      ngos,
      volunteers,
      donations,
      operations,
      users,
      criticalEmergencies,
      pendingAssistance,
      pendingApprovals,
    ] = await Promise.all([
      Emergency.find().sort({ createdAt: -1 }),
      Assistance.find().sort({ createdAt: -1 }),
      ReliefCamp.find().sort({ createdAt: -1 }),
      User.find({ role: "NGO" }).select("-password").sort({ createdAt: -1 }),
      User.find({ role: "Volunteer" }).select("-password").sort({ createdAt: -1 }),
      Donation.find().populate("donor", "fullName email phone").sort({ createdAt: -1 }),
      GovernmentOperation.find().populate("assignedNGO", "fullName email").populate("assignedVolunteers", "fullName email").populate("reliefCamp", "name location").sort({ createdAt: -1 }),
      User.find().select("-password").sort({ createdAt: -1 }),
      Emergency.countDocuments({ status: { $in: ["Pending", "Acknowledged", "In Progress"] }, severity: "Critical" }),
      Assistance.countDocuments({ status: { $in: ["Pending", "Acknowledged", "In Progress"] } }),
      User.countDocuments({ approvalStatus: "Pending" }),
    ]);

    const totalCapacity = camps.reduce((sum, camp) => sum + Number(camp.capacity || 0), 0);
    const occupiedCapacity = camps.reduce((sum, camp) => sum + Number(camp.occupied || 0), 0);
    const donationAmount = donations.reduce((sum, donation) => sum + Number(donation.amount || 0), 0);

    res.json({
      success: true,
      data: { emergencies, assistance, camps, ngos, volunteers, donations, operations, users },
      stats: {
        activeEmergencies: emergencies.filter((x) => activeStatuses.includes(x.status)).length,
        activeAssistance: assistance.filter((x) => activeStatuses.includes(x.status)).length,
        reliefCamps: camps.length,
        ngos: ngos.length,
        volunteers: volunteers.length,
        totalUsers: users.length,
        donationRecords: donations.length,
        donationAmount,
        activeOperations: operations.filter((x) => ["Planned", "In Progress"].includes(x.status)).length,
        criticalEmergencies,
        pendingAssistance,
        pendingApprovals,
        totalCapacity,
        occupiedCapacity,
      },
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    res.status(500).json({ success: false, message: "Failed to load admin overview." });
  }
};

const getAdminEmergencies = async (req, res) => {
  try {
    const emergencies = await populateRequest(Emergency.find().sort({ createdAt: -1 }));
    res.json({ success: true, emergencies });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load emergencies." });
  }
};

const updateEmergency = async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) return res.status(404).json({ success: false, message: "Emergency not found." });
    const allowed = ["Pending", "Acknowledged", "In Progress", "Resolved", "Rejected"];
    if (req.body.status && !allowed.includes(req.body.status)) return res.status(400).json({ success: false, message: "Invalid emergency status." });
    ["status", "severity", "handledByNGO", "handledByGovernment", "assignedVolunteer"].forEach((field) => {
      if (req.body[field] !== undefined) emergency[field] = isValidId(req.body[field]) || ["status", "severity"].includes(field) ? req.body[field] : emergency[field];
    });
    if (req.body.status !== undefined) emergency.status = req.body.status;
    if (req.body.severity !== undefined) emergency.severity = req.body.severity;
    await emergency.save();
    await log(req, "Updated", "Emergencies", `Updated emergency ${emergency._id}.`, emergency._id);
    res.json({ success: true, message: "Emergency updated.", emergency });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update emergency." });
  }
};

const getAdminAssistance = async (req, res) => {
  try {
    const assistance = await populateRequest(Assistance.find().sort({ createdAt: -1 }));
    res.json({ success: true, assistance });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load assistance requests." });
  }
};

const updateAssistance = async (req, res) => {
  try {
    const assistance = await Assistance.findById(req.params.id);
    if (!assistance) return res.status(404).json({ success: false, message: "Assistance request not found." });
    const allowed = ["Pending", "Acknowledged", "In Progress", "Fulfilled", "Rejected"];
    if (req.body.status && !allowed.includes(req.body.status)) return res.status(400).json({ success: false, message: "Invalid assistance status." });
    ["status", "priority"].forEach((field) => {
      if (req.body[field] !== undefined) assistance[field] = req.body[field];
    });
    ["handledByNGO", "handledByGovernment", "assignedVolunteer"].forEach((field) => {
      if (req.body[field] !== undefined) assistance[field] = isValidId(req.body[field]) ? req.body[field] : null;
    });
    await assistance.save();
    await log(req, "Updated", "Assistance", `Updated assistance request ${assistance._id}.`, assistance._id);
    res.json({ success: true, message: "Assistance request updated.", assistance });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update assistance request." });
  }
};

const getAdminCamps = async (req, res) => {
  try {
    const camps = await ReliefCamp.find().populate("managedByNGO", "fullName email").populate("managedByGovernment", "fullName email").sort({ createdAt: -1 });
    res.json({ success: true, camps });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load relief camps." });
  }
};

const createAdminCamp = async (req, res) => {
  try {
    const { name, location, contactNumber, capacity, occupied, facilities, status, latitude, longitude, description, managedByNGO, managedByGovernment } = req.body;
    if (!name || !location || capacity === undefined) return res.status(400).json({ success: false, message: "Name, location and capacity are required." });
    const cap = Number(capacity); const occ = Number(occupied || 0);
    if (Number.isNaN(cap) || cap < 0 || Number.isNaN(occ) || occ < 0 || occ > cap) return res.status(400).json({ success: false, message: "Occupancy must be between 0 and capacity." });
    const camp = await ReliefCamp.create({ name, location, contactNumber, capacity: cap, occupied: occ, facilities: Array.isArray(facilities) ? facilities : [], status: status || (occ >= cap ? "Full" : occ >= cap * 0.8 ? "Limited Capacity" : "Open"), latitude, longitude, description, managedByNGO: isValidId(managedByNGO) ? managedByNGO : null, managedByGovernment: isValidId(managedByGovernment) ? managedByGovernment : null });
    await log(req, "Created", "Relief Camps", `Created relief camp ${camp.name}.`, camp._id);
    res.status(201).json({ success: true, message: "Relief camp created.", camp });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to create relief camp." });
  }
};

const updateAdminCamp = async (req, res) => {
  try {
    const camp = await ReliefCamp.findById(req.params.id);
    if (!camp) return res.status(404).json({ success: false, message: "Relief camp not found." });
    const nextCapacity = req.body.capacity !== undefined ? Number(req.body.capacity) : camp.capacity;
    const nextOccupied = req.body.occupied !== undefined ? Number(req.body.occupied) : camp.occupied;
    if (nextCapacity < 0 || nextOccupied < 0 || nextOccupied > nextCapacity) return res.status(400).json({ success: false, message: "Occupancy must be between 0 and capacity." });
    ["name", "location", "contactNumber", "facilities", "status", "latitude", "longitude", "description", "managedByNGO", "managedByGovernment"].forEach((field) => { if (req.body[field] !== undefined) camp[field] = req.body[field] || null; });
    camp.capacity = nextCapacity; camp.occupied = nextOccupied;
    if (req.body.status === undefined) camp.status = nextOccupied >= nextCapacity ? "Full" : nextOccupied >= nextCapacity * 0.8 ? "Limited Capacity" : "Open";
    await camp.save();
    await log(req, "Updated", "Relief Camps", `Updated relief camp ${camp.name}.`, camp._id);
    res.json({ success: true, message: "Relief camp updated.", camp });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update relief camp." });
  }
};

const deleteAdminCamp = async (req, res) => {
  try {
    const camp = await ReliefCamp.findByIdAndDelete(req.params.id);
    if (!camp) return res.status(404).json({ success: false, message: "Relief camp not found." });
    await log(req, "Deleted", "Relief Camps", `Deleted relief camp ${camp.name}.`, camp._id);
    res.json({ success: true, message: "Relief camp deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete relief camp." });
  }
};

const getAdminOperations = async (req, res) => {
  try {
    const operations = await GovernmentOperation.find().populate("assignedNGO", "fullName email").populate("assignedVolunteers", "fullName email").populate("reliefCamp", "name location").populate("emergency", "emergencyType location status").populate("assistance", "assistanceType location status").sort({ createdAt: -1 });
    res.json({ success: true, operations });
  } catch (error) { res.status(500).json({ success: false, message: "Failed to load operations." }); }
};

const createAdminOperation = async (req, res) => {
  try {
    const { title, operationType, emergency, assistance, assignedNGO, assignedVolunteers, reliefCamp, resources, affectedPeople, location, description, status } = req.body;
    if (!title || !operationType) return res.status(400).json({ success: false, message: "Title and operation type are required." });
    const operation = await GovernmentOperation.create({ adminOfficer: req.user._id, title, operationType, emergency: isValidId(emergency) ? emergency : null, assistance: isValidId(assistance) ? assistance : null, assignedNGO: isValidId(assignedNGO) ? assignedNGO : null, assignedVolunteers: Array.isArray(assignedVolunteers) ? assignedVolunteers.filter(isValidId) : [], reliefCamp: isValidId(reliefCamp) ? reliefCamp : null, resources: Array.isArray(resources) ? resources : [], affectedPeople: Number(affectedPeople) || 0, location: location || "", description: description || "", status: status || "Planned" });
    await log(req, "Created", "Operations", `Created operation ${operation.title}.`, operation._id);
    res.status(201).json({ success: true, message: "Operation created.", operation });
  } catch (error) { console.error(error); res.status(500).json({ success: false, message: "Failed to create operation." }); }
};

const updateAdminOperation = async (req, res) => {
  try {
    const operation = await GovernmentOperation.findById(req.params.id);
    if (!operation) return res.status(404).json({ success: false, message: "Operation not found." });
    const allowed = ["Planned", "In Progress", "Completed", "Cancelled"];
    if (req.body.status && !allowed.includes(req.body.status)) return res.status(400).json({ success: false, message: "Invalid operation status." });
    ["title", "operationType", "resources", "affectedPeople", "location", "description", "status"].forEach((field) => { if (req.body[field] !== undefined) operation[field] = req.body[field]; });
    ["emergency", "assistance", "assignedNGO", "reliefCamp"].forEach((field) => { if (req.body[field] !== undefined) operation[field] = isValidId(req.body[field]) ? req.body[field] : null; });
    if (req.body.assignedVolunteers !== undefined) operation.assignedVolunteers = Array.isArray(req.body.assignedVolunteers) ? req.body.assignedVolunteers.filter(isValidId) : [];
    await operation.save();
    await log(req, "Updated", "Operations", `Updated operation ${operation.title}.`, operation._id);
    res.json({ success: true, message: "Operation updated.", operation });
  } catch (error) { res.status(500).json({ success: false, message: "Failed to update operation." }); }
};

const deleteAdminOperation = async (req, res) => {
  try {
    const operation = await GovernmentOperation.findByIdAndDelete(req.params.id);
    if (!operation) return res.status(404).json({ success: false, message: "Operation not found." });
    await log(req, "Deleted", "Operations", `Deleted operation ${operation.title}.`, operation._id);
    res.json({ success: true, message: "Operation deleted." });
  } catch (error) { res.status(500).json({ success: false, message: "Failed to delete operation." }); }
};

const getUsersByRole = (role) => async (req, res) => {
  try {
    const users = await User.find({ role }).select("-password").sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) { res.status(500).json({ success: false, message: `Failed to load ${role.toLowerCase()}s.` }); }
};

const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) { res.status(500).json({ success: false, message: "Failed to load users." }); }
};

const updateAdminUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    if (user._id.toString() === req.user._id.toString() && req.body.isActive === false) return res.status(400).json({ success: false, message: "You cannot deactivate your own admin account." });
    if (req.body.role && !["Citizen", "Volunteer", "Donor", "NGO", "Government", "Admin"].includes(req.body.role)) return res.status(400).json({ success: false, message: "Invalid role." });
    ["fullName", "phone", "address", "role", "isActive", "approvalStatus"].forEach((field) => { if (req.body[field] !== undefined) user[field] = req.body[field]; });
    await user.save();
    await log(req, "Updated", "Users", `Updated user ${user.fullName}.`, user._id, { role: user.role, isActive: user.isActive, approvalStatus: user.approvalStatus });
    res.json({ success: true, message: "User updated.", user: await User.findById(user._id).select("-password") });
  } catch (error) { res.status(500).json({ success: false, message: "Failed to update user." }); }
};

const getAdminDonations = async (req, res) => {
  try {
    const donations = await Donation.find().populate("donor", "fullName email phone").sort({ createdAt: -1 });
    const ngoContributions = await NGOContribution.find().populate("ngo", "fullName email phone").sort({ createdAt: -1 });
    res.json({ success: true, donations, ngoContributions });
  } catch (error) { res.status(500).json({ success: false, message: "Failed to load donations." }); }
};

const updateDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ success: false, message: "Donation not found." });
    if (req.body.status && !["Recorded", "Verified", "Used"].includes(req.body.status)) return res.status(400).json({ success: false, message: "Invalid donation status." });
    if (req.body.status) donation.status = req.body.status;
    await donation.save();
    await log(req, "Updated", "Donations", `Updated donation ${donation.referenceId}.`, donation._id);
    res.json({ success: true, message: "Donation updated.", donation });
  } catch (error) { res.status(500).json({ success: false, message: "Failed to update donation." }); }
};

const getDistributions = async (req, res) => {
  try {
    const distributions = await ReliefDistribution.find().populate("camp", "name location").populate("operation", "title").populate("distributedBy", "fullName role").sort({ createdAt: -1 });
    res.json({ success: true, distributions });
  } catch (error) { res.status(500).json({ success: false, message: "Failed to load distributions." }); }
};

const createDistribution = async (req, res) => {
  try {
    const { itemType, quantity, unit, location, recipient, camp, operation, status, notes } = req.body;
    if (!itemType || quantity === undefined) return res.status(400).json({ success: false, message: "Item type and quantity are required." });
    const distribution = await ReliefDistribution.create({ itemType, quantity: Number(quantity), unit: unit || "units", location: location || "", recipient: recipient || "", camp: isValidId(camp) ? camp : null, operation: isValidId(operation) ? operation : null, distributedBy: req.user._id, status: status || "Planned", notes: notes || "" });
    await log(req, "Created", "Distribution", `Created distribution of ${distribution.itemType}.`, distribution._id);
    res.status(201).json({ success: true, message: "Distribution record created.", distribution });
  } catch (error) { res.status(500).json({ success: false, message: "Failed to create distribution." }); }
};

const updateDistribution = async (req, res) => {
  try {
    const distribution = await ReliefDistribution.findById(req.params.id);
    if (!distribution) return res.status(404).json({ success: false, message: "Distribution record not found." });
    ["itemType", "quantity", "unit", "location", "recipient", "status", "notes"].forEach((field) => { if (req.body[field] !== undefined) distribution[field] = req.body[field]; });
    ["camp", "operation"].forEach((field) => { if (req.body[field] !== undefined) distribution[field] = isValidId(req.body[field]) ? req.body[field] : null; });
    distribution.distributedBy = req.user._id;
    await distribution.save();
    await log(req, "Updated", "Distribution", `Updated distribution ${distribution.itemType}.`, distribution._id);
    res.json({ success: true, message: "Distribution updated.", distribution });
  } catch (error) { res.status(500).json({ success: false, message: "Failed to update distribution." }); }
};

const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().populate("createdBy", "fullName email").sort({ createdAt: -1 });
    res.json({ success: true, announcements });
  } catch (error) { res.status(500).json({ success: false, message: "Failed to load announcements." }); }
};

const createAnnouncement = async (req, res) => {
  try {
    const { title, message, audience, priority, status } = req.body;
    if (!title || !message) return res.status(400).json({ success: false, message: "Title and message are required." });
    const announcement = await Announcement.create({ title, message, audience: audience || "All", priority: priority || "Normal", status: status || "Published", createdBy: req.user._id });
    await log(req, "Created", "Announcements", `Created announcement ${announcement.title}.`, announcement._id);
    res.status(201).json({ success: true, message: "Announcement created.", announcement });
  } catch (error) { res.status(500).json({ success: false, message: "Failed to create announcement." }); }
};

const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ success: false, message: "Announcement not found." });
    ["title", "message", "audience", "priority", "status"].forEach((field) => { if (req.body[field] !== undefined) announcement[field] = req.body[field]; });
    await announcement.save();
    await log(req, "Updated", "Announcements", `Updated announcement ${announcement.title}.`, announcement._id);
    res.json({ success: true, message: "Announcement updated.", announcement });
  } catch (error) { res.status(500).json({ success: false, message: "Failed to update announcement." }); }
};

const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) return res.status(404).json({ success: false, message: "Announcement not found." });
    await log(req, "Deleted", "Announcements", `Deleted announcement ${announcement.title}.`, announcement._id);
    res.json({ success: true, message: "Announcement deleted." });
  } catch (error) { res.status(500).json({ success: false, message: "Failed to delete announcement." }); }
};

const getApprovals = async (req, res) => {
  try {
    const users = await User.find({ approvalStatus: "Pending" }).select("-password").sort({ createdAt: -1 });
    res.json({ success: true, approvals: users });
  } catch (error) { res.status(500).json({ success: false, message: "Failed to load approvals." }); }
};

const updateApproval = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "Approval target not found." });
    if (!["Approved", "Rejected", "Pending"].includes(req.body.status)) return res.status(400).json({ success: false, message: "Invalid approval status." });
    user.approvalStatus = req.body.status;
    await user.save();
    await log(req, req.body.status, "Approvals", `${req.body.status} account for ${user.fullName}.`, user._id);
    res.json({ success: true, message: `User ${req.body.status.toLowerCase()}.`, user: await User.findById(user._id).select("-password") });
  } catch (error) { res.status(500).json({ success: false, message: "Failed to update approval." }); }
};

const getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find().populate("performedBy", "fullName email role").sort({ createdAt: -1 }).limit(500);
    res.json({ success: true, logs });
  } catch (error) { res.status(500).json({ success: false, message: "Failed to load activity logs." }); }
};

const getSettings = async (req, res) => {
  try {
    const settings = await SystemSetting.find().sort({ key: 1 });
    res.json({ success: true, settings });
  } catch (error) { res.status(500).json({ success: false, message: "Failed to load system settings." }); }
};

const updateSetting = async (req, res) => {
  try {
    const { key, value, description } = req.body;
    if (!key) return res.status(400).json({ success: false, message: "Setting key is required." });
    const setting = await SystemSetting.findOneAndUpdate({ key }, { value, description: description || "", updatedBy: req.user._id }, { new: true, upsert: true, setDefaultsOnInsert: true });
    await log(req, "Updated", "System Settings", `Updated system setting ${key}.`, setting._id);
    res.json({ success: true, message: "Setting saved.", setting });
  } catch (error) { res.status(500).json({ success: false, message: "Failed to save setting." }); }
};

const getReports = async (req, res) => {
  try {
    const [emergencies, assistance, operations, donations, distributions, users, camps] = await Promise.all([
      Emergency.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Assistance.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      GovernmentOperation.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Donation.aggregate([{ $group: { _id: "$status", count: { $sum: 1 }, amount: { $sum: "$amount" } } }]),
      ReliefDistribution.aggregate([{ $group: { _id: "$status", count: { $sum: 1 }, quantity: { $sum: "$quantity" } } }]),
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      ReliefCamp.aggregate([{ $group: { _id: "$status", count: { $sum: 1 }, capacity: { $sum: "$capacity" }, occupied: { $sum: "$occupied" } } }]),
    ]);
    res.json({ success: true, report: { emergencies, assistance, operations, donations, distributions, users, camps } });
  } catch (error) { res.status(500).json({ success: false, message: "Failed to generate reports." }); }
};

const getMapData = async (req, res) => {
  try {
    const [emergencies, assistance, camps] = await Promise.all([
      Emergency.find({ latitude: { $ne: null }, longitude: { $ne: null } }).select("emergencyType severity location latitude longitude status createdAt"),
      Assistance.find({ latitude: { $ne: null }, longitude: { $ne: null } }).select("assistanceType priority location latitude longitude status createdAt"),
      ReliefCamp.find({ latitude: { $ne: null }, longitude: { $ne: null } }).select("name location latitude longitude status capacity occupied createdAt"),
    ]);
    res.json({ success: true, emergencies, assistance, camps });
  } catch (error) { res.status(500).json({ success: false, message: "Failed to load disaster map data." }); }
};

module.exports = {
  getAdminOverview,
  getAdminEmergencies,
  updateEmergency,
  getAdminAssistance,
  updateAssistance,
  getAdminCamps,
  createAdminCamp,
  updateAdminCamp,
  deleteAdminCamp,
  getAdminOperations,
  createAdminOperation,
  updateAdminOperation,
  deleteAdminOperation,
  getAdminUsers,
  getUsersByRole,
  updateAdminUser,
  getAdminDonations,
  updateDonation,
  getDistributions,
  createDistribution,
  updateDistribution,
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getApprovals,
  updateApproval,
  getActivityLogs,
  getSettings,
  updateSetting,
  getReports,
  getMapData,
};
