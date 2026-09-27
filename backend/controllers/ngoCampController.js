const ReliefCamp = require("../models/ReliefCamp");

const calculateStatus = (requestedStatus, occupied, capacity) => {
  if (requestedStatus === "Closed") return "Closed";
  if (occupied >= capacity) return "Full";
  if (capacity > 0 && occupied / capacity >= 0.8) return "Limited Capacity";
  return "Open";
};

const getNgoCamps = async (req, res) => {
  try {
    const camps = await ReliefCamp.find().sort({ createdAt: -1 });
    const mapped = camps.map((camp) => ({
      ...camp.toObject(),
      isOwnedByNgo: String(camp.managedByNGO || "") === String(req.user._id),
    }));
    res.status(200).json({ success: true, camps: mapped });
  } catch (error) {
    console.error("Get NGO camps error:", error);
    res.status(500).json({ success: false, message: "Failed to load relief camps." });
  }
};

const createNgoCamp = async (req, res) => {
  try {
    const { name, location, contactNumber, capacity, occupied = 0, facilities = [], status, latitude, longitude, description } = req.body;
    const numericCapacity = Number(capacity);
    const numericOccupied = Number(occupied);
    if (!name || !location || !Number.isFinite(numericCapacity) || numericCapacity <= 0) return res.status(400).json({ success: false, message: "Camp name, location and valid capacity are required." });
    if (!Number.isFinite(numericOccupied) || numericOccupied < 0 || numericOccupied > numericCapacity) return res.status(400).json({ success: false, message: "Occupied count must be between 0 and capacity." });

    const camp = await ReliefCamp.create({
      name, location, contactNumber, capacity: numericCapacity, occupied: numericOccupied,
      facilities: Array.isArray(facilities) ? facilities : [],
      status: calculateStatus(status, numericOccupied, numericCapacity),
      latitude, longitude, description, managedByNGO: req.user._id,
    });
    res.status(201).json({ success: true, message: "NGO relief camp created successfully.", camp });
  } catch (error) {
    console.error("Create NGO camp error:", error);
    res.status(500).json({ success: false, message: "Failed to create relief camp." });
  }
};

const updateNgoCamp = async (req, res) => {
  try {
    const camp = await ReliefCamp.findOne({ _id: req.params.id, managedByNGO: req.user._id });
    if (!camp) return res.status(404).json({ success: false, message: "NGO relief camp not found or not managed by your NGO." });

    const { name, location, contactNumber, capacity, occupied = 0, facilities = [], status, latitude, longitude, description } = req.body;
    const numericCapacity = Number(capacity);
    const numericOccupied = Number(occupied);
    if (!name || !location || !Number.isFinite(numericCapacity) || numericCapacity <= 0) return res.status(400).json({ success: false, message: "Camp name, location and valid capacity are required." });
    if (!Number.isFinite(numericOccupied) || numericOccupied < 0 || numericOccupied > numericCapacity) return res.status(400).json({ success: false, message: "Occupied count must be between 0 and capacity." });

    Object.assign(camp, { name, location, contactNumber, capacity: numericCapacity, occupied: numericOccupied, facilities: Array.isArray(facilities) ? facilities : [], status: calculateStatus(status, numericOccupied, numericCapacity), latitude, longitude, description });
    await camp.save();
    res.status(200).json({ success: true, message: "NGO relief camp updated successfully.", camp });
  } catch (error) {
    console.error("Update NGO camp error:", error);
    res.status(500).json({ success: false, message: "Failed to update relief camp." });
  }
};

const deleteNgoCamp = async (req, res) => {
  try {
    const camp = await ReliefCamp.findOneAndDelete({ _id: req.params.id, managedByNGO: req.user._id });
    if (!camp) return res.status(404).json({ success: false, message: "NGO relief camp not found or not managed by your NGO." });
    res.status(200).json({ success: true, message: "NGO relief camp deleted successfully." });
  } catch (error) {
    console.error("Delete NGO camp error:", error);
    res.status(500).json({ success: false, message: "Failed to delete relief camp." });
  }
};

module.exports = { getNgoCamps, createNgoCamp, updateNgoCamp, deleteNgoCamp };
