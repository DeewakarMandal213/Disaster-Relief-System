const NGOContribution = require("../models/NGOContribution");

const createReferenceId = () =>
  `NGO-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

const contribute = async (req, res) => {
  try {
    const {
      contributionType,
      amount,
      quantity,
      itemType,
      purpose,
      description,
    } = req.body;

    // Normalize values coming from the frontend.
    const normalizedType =
      contributionType === "Relief Supplies" ? "Supplies" : contributionType;

    const normalizedAmount = Number(amount || 0);
    const normalizedQuantity = String(quantity ?? "").trim();

    if (!["Money", "Supplies"].includes(normalizedType)) {
      return res.status(400).json({
        message: "Please select a valid contribution type.",
      });
    }

    if (!purpose) {
      return res.status(400).json({
        message: "Please select a contribution purpose.",
      });
    }

    if (normalizedType === "Money" && (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0)) {
      return res.status(400).json({
        message: "Please enter a valid contribution amount.",
      });
    }

    if (normalizedType === "Supplies" && (!normalizedQuantity || !itemType)) {
      return res.status(400).json({
        message: "Please enter the supply type and quantity.",
      });
    }

    // Generate a fresh reference and retry once if a very unlikely
    // duplicate reference is encountered.
    let referenceId = createReferenceId();
    let contribution;

    try {
      contribution = await NGOContribution.create({
        ngo: req.user._id,
        contributionType: normalizedType,
        amount: normalizedType === "Money" ? normalizedAmount : 0,
        quantity: normalizedType === "Supplies" ? normalizedQuantity : "",
        itemType: normalizedType === "Supplies" ? itemType : "Food",
        purpose,
        description: String(description || "").trim(),
        referenceId,
      });
    } catch (createError) {
      // Retry once for a duplicate referenceId.
      if (createError?.code === 11000 && createError?.keyPattern?.referenceId) {
        referenceId = createReferenceId();
        contribution = await NGOContribution.create({
          ngo: req.user._id,
          contributionType: normalizedType,
          amount: normalizedType === "Money" ? normalizedAmount : 0,
          quantity: normalizedType === "Supplies" ? normalizedQuantity : "",
          itemType: normalizedType === "Supplies" ? itemType : "Food",
          purpose,
          description: String(description || "").trim(),
          referenceId,
        });
      } else {
        throw createError;
      }
    }

    return res.status(201).json({
      success: true,
      message: "NGO contribution recorded successfully.",
      contribution,
    });
  } catch (error) {
    console.error("NGO contribution error:", error);

    // Return useful validation information while keeping the API response
    // safe for the frontend.
    if (error?.name === "ValidationError") {
      const details = Object.values(error.errors || {})
        .map((item) => item.message)
        .join(" ");

      return res.status(400).json({
        message: details || "Please check the contribution details.",
      });
    }

    return res.status(500).json({
      message: "Failed to record NGO contribution.",
    });
  }
};

const getMyContributions = async (req, res) => {
  try {
    const contributions = await NGOContribution.find({ ngo: req.user._id })
      .sort({ createdAt: -1 });

    return res.json({ contributions });
  } catch (error) {
    console.error("Get NGO contributions error:", error);
    return res.status(500).json({
      message: "Failed to load NGO contributions.",
    });
  }
};

module.exports = {
  contribute,
  getMyContributions,
};
