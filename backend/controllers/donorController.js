const crypto = require("crypto");
const Donation = require("../models/Donation");

// =========================================================
// Generate Donation Reference ID
// =========================================================

const generateReferenceId = () => {
  const randomPart = crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase();

  return `DON-${Date.now()}-${randomPart}`;
};


// =========================================================
// Create Donation
// =========================================================

const createDonation = async (req, res) => {
  try {
    const {
      amount,
      donationType,
      message,
    } = req.body;

    // Validate amount
    if (
      amount === undefined ||
      amount === null ||
      amount === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Donation amount is required.",
      });
    }

    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount)) {
      return res.status(400).json({
        success: false,
        message: "Donation amount must be a valid number.",
      });
    }

    if (numericAmount < 1) {
      return res.status(400).json({
        success: false,
        message: "Donation amount must be at least ₹1.",
      });
    }

    // Validate donation type
    const allowedDonationTypes = [
      "Food",
      "Water",
      "Medical Supplies",
      "Shelter",
      "Essential Supplies",
      "General Relief",
    ];

    if (
      donationType &&
      !allowedDonationTypes.includes(donationType)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid donation category.",
      });
    }

    // Create donation
    const donation = await Donation.create({
      donor: req.user._id,
      amount: numericAmount,
      donationType:
        donationType || "General Relief",
      message: message || "",
      referenceId: generateReferenceId(),
    });

    // Return populated donor information
    const populatedDonation =
      await Donation.findById(donation._id)
        .populate(
          "donor",
          "fullName email phone"
        );

    res.status(201).json({
      success: true,
      message: "Donation recorded successfully.",
      donation: populatedDonation,
    });
  } catch (error) {
    console.error(
      "Create donation error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to record donation.",
    });
  }
};


// =========================================================
// Get My Donations
// =========================================================

const getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({
      donor: req.user._id,
    })
      .sort({
        createdAt: -1,
      })
      .populate(
        "donor",
        "fullName email"
      );

    res.status(200).json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    console.error(
      "Get my donations error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load donation history.",
    });
  }
};


// =========================================================
// Get Donation By Reference ID
// =========================================================

const getDonationByReference = async (
  req,
  res
) => {
  try {
    const { referenceId } = req.params;

    const donation = await Donation.findOne({
      referenceId,
      donor: req.user._id,
    }).populate(
      "donor",
      "fullName email phone"
    );

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found.",
      });
    }

    res.status(200).json({
      success: true,
      donation,
    });
  } catch (error) {
    console.error(
      "Get donation error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load donation.",
    });
  }
};


// =========================================================
// Get Donor Statistics
// =========================================================

const getDonorStats = async (req, res) => {
  try {
    const donations = await Donation.find({
      donor: req.user._id,
    });

    const totalDonated = donations.reduce(
      (total, donation) =>
        total + donation.amount,
      0
    );

    const totalDonations = donations.length;

    const recordedDonations =
      donations.filter(
        (donation) =>
          donation.status === "Recorded"
      ).length;

    const verifiedDonations =
      donations.filter(
        (donation) =>
          donation.status === "Verified"
      ).length;

    const usedDonations =
      donations.filter(
        (donation) =>
          donation.status === "Used"
      ).length;

    res.status(200).json({
      success: true,
      stats: {
        totalDonated,
        totalDonations,
        recordedDonations,
        verifiedDonations,
        usedDonations,
      },
    });
  } catch (error) {
    console.error(
      "Get donor stats error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load donor statistics.",
    });
  }
};


module.exports = {
  createDonation,
  getMyDonations,
  getDonationByReference,
  getDonorStats,
};