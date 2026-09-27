const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();


// =========================================================
// MIDDLEWARE
// =========================================================

app.use(cors());
app.use(express.json());


// =========================================================
// ROUTES
// =========================================================

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const emergencyRoutes = require("./routes/emergencyRoutes");
app.use("/api/emergencies", emergencyRoutes);

const assistanceRoutes = require("./routes/assistanceRoutes");
app.use("/api/assistance", assistanceRoutes);

const reliefCampRoutes = require("./routes/reliefCampRoutes");
app.use("/api/relief-camps", reliefCampRoutes);

const dashboardRoutes = require("./routes/dashboardRoutes");
app.use("/api/dashboard", dashboardRoutes);

const volunteerRoutes = require("./routes/volunteerRoutes");
app.use("/api/volunteers", volunteerRoutes);

const donorRoutes = require("./routes/donorRoutes");
app.use("/api/donations", donorRoutes);

const ngoRoutes = require("./routes/ngoRoutes");
app.use("/api/ngo", ngoRoutes);

const ngoCharityRoutes = require("./routes/ngoCharityRoutes");
app.use("/api/ngo-charity", ngoCharityRoutes);

const governmentRoutes = require("./routes/governmentRoutes");
app.use("/api/government", governmentRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

// =========================================================
// ROOT API
// =========================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "🚑 Local Disaster Relief Coordination Platform API is running!",
    version: "1.0.0",
  });
});


// =========================================================
// START SERVER
// =========================================================

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(
    `🚀 Server is running on http://localhost:${PORT}`
  );
});