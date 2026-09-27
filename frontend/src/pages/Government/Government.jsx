import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  FaChartPie,
  FaExclamationTriangle,
  FaHandsHelping,
  FaBuilding,
  FaUsers,
  FaCampground,
  FaDonate,
  FaClipboardList,
  FaMapMarkedAlt,
  FaFileAlt,
  FaUser,
  FaSignOutAlt,
  FaSyncAlt,
  FaCheckCircle,
  FaClock,
  FaShieldAlt,
  FaArrowRight,
  FaTimes,
  FaKey,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import GovernmentEmergencies from "./GovernmentEmergencies";
import GovernmentAssistance from "./GovernmentAssistance";
import GovernmentOperations from "./GovernmentOperations";
import GovernmentNGOs from "./GovernmentNGOs";
import GovernmentVolunteers from "./GovernmentVolunteers";
import GovernmentCamps from "./GovernmentCamps";
import GovernmentDonations from "./GovernmentDonations";
import GovernmentDistribution from "./GovernmentDistribution";
import GovernmentResponseMap from "./GovernmentResponseMap";
import GovernmentReports from "./GovernmentReports";
import "./Government.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const emptyStats = {
  totalEmergencies: 0,
  pendingEmergencies: 0,
  activeEmergencies: 0,
  resolvedEmergencies: 0,
  criticalEmergencies: 0,
  totalAssistance: 0,
  pendingAssistance: 0,
  activeAssistance: 0,
  resolvedAssistance: 0,
  volunteers: 0,
  ngos: 0,
  reliefCamps: 0,
  donations: 0,
  donationAmount: 0,
  ngoContributions: 0,
  ngoContributionAmount: 0,
  activeOperations: 0,
  peopleHelped: 0,
};

function Government() {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();

  const [activeSection, setActiveSection] = useState("dashboard");
  const [stats, setStats] = useState(emptyStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const [profileEditing, setProfileEditing] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phone: "",
    address: "",
  });

  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [dashboardRes, emergencyRes, assistanceRes] = await Promise.all([
        API.get("/government/dashboard"),
        API.get("/government/emergencies"),
        API.get("/government/assistance"),
      ]);

      const dashboardStats = { ...emptyStats, ...(dashboardRes.data?.stats || {}) };
      const emergencies = emergencyRes.data?.emergencies || [];
      const assistance = assistanceRes.data?.assistance || [];

      // Emergency/assistance request counts are derived from the actual records
      // so the Government dashboard stays consistent with the database-backed
      // monitoring pages and the Citizen/Admin portals.
      const isResolvedEmergency = (status) =>
        ["resolved", "rejected"].includes(String(status || "").toLowerCase());
      const isClosedAssistance = (status) =>
        ["fulfilled", "rejected"].includes(String(status || "").toLowerCase());

      const activeEmergencies = emergencies.filter(
        (item) => !isResolvedEmergency(item.status)
      );
      const activeAssistance = assistance.filter(
        (item) => !isClosedAssistance(item.status)
      );
      const resolvedEmergencies = emergencies.filter(
        (item) => String(item.status || "").toLowerCase() === "resolved"
      );
      const resolvedAssistance = assistance.filter(
        (item) => ["fulfilled", "resolved"].includes(String(item.status || "").toLowerCase())
      );

      setStats({
        ...dashboardStats,
        totalEmergencies: emergencies.length,
        pendingEmergencies: emergencies.filter((item) =>
          ["pending", "acknowledged"].includes(
            String(item.status || "").toLowerCase()
          )
        ).length,
        activeEmergencies: activeEmergencies.length,
        resolvedEmergencies: resolvedEmergencies.length,
        criticalEmergencies: activeEmergencies.filter(
          (item) => String(item.severity || "").toLowerCase() === "critical"
        ).length,
        totalAssistance: assistance.length,
        pendingAssistance: assistance.filter(
          (item) => String(item.status || "").toLowerCase() === "pending"
        ).length,
        activeAssistance: activeAssistance.length,
        resolvedAssistance: resolvedAssistance.length,
      });

      setLastUpdated(new Date());
    } catch (err) {
      console.error("Government dashboard error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load government dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    if (user.role !== "Government") {
      navigate("/login", { replace: true });
      return;
    }

    setProfileForm({
      fullName: user.fullName || "",
      phone: user.phone || "",
      address: user.address || "",
    });

    loadDashboard();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const openProfile = () => {
    setActiveSection("profile");
    setProfileEditing(false);
    setProfileMessage("");
    setProfileError("");
    setShowPasswordSection(false);
    setPasswordMessage("");
    setPasswordError("");
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleProfileChange = (event) => {
    setProfileForm({
      ...profileForm,
      [event.target.name]: event.target.value,
    });
    setProfileMessage("");
    setProfileError("");
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();

    try {
      setProfileSaving(true);
      setProfileMessage("");
      setProfileError("");

      await updateProfile(profileForm);
      setProfileEditing(false);
      setProfileMessage("Profile updated successfully.");
    } catch (err) {
      setProfileError(
        err.response?.data?.message || "Failed to update profile."
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = (event) => {
    setPasswordForm({
      ...passwordForm,
      [event.target.name]: event.target.value,
    });
    setPasswordMessage("");
    setPasswordError("");
  };

  const handlePasswordSave = async (event) => {
    event.preventDefault();

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    try {
      setPasswordSaving(true);
      setPasswordMessage("");
      setPasswordError("");

      await API.put("/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordMessage("Password changed successfully.");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswords({ current: false, next: false, confirm: false });
    } catch (err) {
      setPasswordError(
        err.response?.data?.message || "Failed to change password."
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  const formatMoney = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

  const chartData = useMemo(
    () => ({
      labels: ["Emergencies", "Assistance"],
      datasets: [
        {
          label: "Total Requests",
          data: [stats.totalEmergencies, stats.totalAssistance],
          backgroundColor: "#2563eb",
          borderColor: "#2563eb",
          borderRadius: 8,
        },
        {
          label: "Active Requests",
          data: [stats.activeEmergencies, stats.activeAssistance],
          backgroundColor: "#16a34a",
          borderColor: "#16a34a",
          borderRadius: 8,
        },
        {
          label: "Pending Requests",
          data: [stats.pendingEmergencies, stats.pendingAssistance],
          backgroundColor: "#f59e0b",
          borderColor: "#f59e0b",
          borderRadius: 8,
        },
      ],
    }),
    [stats]
  );

  const responseChartData = useMemo(
    () => ({
      labels: ["People Helped", "Active Emergencies", "Active Assistance", "Critical Emergencies"],
      datasets: [
        {
          data: [
            stats.peopleHelped,
            stats.activeEmergencies,
            stats.activeAssistance,
            stats.criticalEmergencies,
          ],
          backgroundColor: ["#2563eb", "#16a34a", "#f59e0b", "#dc2626"],
          borderColor: "#ffffff",
          borderWidth: 2,
        },
      ],
    }),
    [stats]
  );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { usePointStyle: true, boxWidth: 8 },
      },
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  };

  const menu = [
    { key: "dashboard", label: "Dashboard", icon: <FaChartPie /> },
    { key: "emergencies", label: "Emergencies", icon: <FaExclamationTriangle />, count: stats.pendingEmergencies },
    { key: "assistance", label: "Assistance Requests", icon: <FaHandsHelping />, count: stats.pendingAssistance },
    { key: "operations", label: "Government Operations", icon: <FaClipboardList />, count: stats.activeOperations },
    { key: "ngos", label: "NGOs", icon: <FaBuilding /> },
    { key: "volunteers", label: "Volunteers", icon: <FaUsers /> },
    { key: "camps", label: "Relief Camps", icon: <FaCampground /> },
    { key: "donations", label: "Donations", icon: <FaDonate /> },
    { key: "distribution", label: "Relief Distribution", icon: <FaHandsHelping /> },
    { key: "map", label: "Response Map", icon: <FaMapMarkedAlt /> },
    { key: "reports", label: "Reports", icon: <FaFileAlt /> },
  ];

  const statCards = [
    { label: "Total Emergency Requests", value: stats.totalEmergencies, icon: <FaExclamationTriangle />, tone: "red" },
    { label: "Pending Emergencies", value: stats.pendingEmergencies, icon: <FaClock />, tone: "orange" },
    { label: "Critical Emergencies", value: stats.criticalEmergencies, icon: <FaShieldAlt />, tone: "critical" },
    { label: "Resolved Emergencies", value: stats.resolvedEmergencies, icon: <FaCheckCircle />, tone: "blue" },
    { label: "Total Assistance Requests", value: stats.totalAssistance, icon: <FaHandsHelping />, tone: "green" },
    { label: "Pending Assistance", value: stats.pendingAssistance, icon: <FaClock />, tone: "orange" },
    { label: "Resolved Assistance", value: stats.resolvedAssistance, icon: <FaCheckCircle />, tone: "teal" },
    { label: "Active Operations", value: stats.activeOperations, icon: <FaClipboardList />, tone: "blue" },
    { label: "Volunteers", value: stats.volunteers, icon: <FaUsers />, tone: "purple" },
    { label: "NGOs", value: stats.ngos, icon: <FaBuilding />, tone: "teal" },
    { label: "Relief Camps", value: stats.reliefCamps, icon: <FaCampground />, tone: "indigo" },
  ];

  const comingSoonTitles = {
    emergencies: "Emergency Monitoring",
    assistance: "Assistance Request Monitoring",
    operations: "Government Operations",
    ngos: "NGO Coordination",
    volunteers: "Volunteer Coordination",
    camps: "Relief Camp Management",
    donations: "Donation Monitoring",
    distribution: "Relief Distribution",
    map: "Response Map",
    reports: "Government Reports",
  };

  if (!user) {
    return <div className="government-loading-screen">Loading Government Portal...</div>;
  }

  return (
    <div className="government-portal">
      <aside className="government-sidebar">
        <div className="government-brand">
          <div className="government-brand-logo">RC</div>
          <div>
            <h2>Relief<span>Connect</span></h2>
            <p>Government Portal</p>
          </div>
        </div>

        <div className="government-sidebar-divider" />

        <nav className="government-navigation">
          {menu.map((item) => (
            <button
              key={item.key}
              className={`government-menu ${activeSection === item.key ? "active" : ""}`}
              onClick={() => setActiveSection(item.key)}
            >
              <span className="government-menu-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.count > 0 && <span className="government-menu-count">{item.count}</span>}
            </button>
          ))}
        </nav>

        <div className="government-sidebar-bottom">
          <button
            className={`government-menu ${activeSection === "profile" ? "active" : ""}`}
            onClick={openProfile}
          >
            <span className="government-menu-icon"><FaUser /></span>
            <span>My Profile</span>
          </button>

          <button className="government-logout" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="government-main">
        <header className="government-topbar">
          <div>
            <p className="government-eyebrow">GOVERNMENT RESPONSE CENTER</p>
            <h1>{activeSection === "dashboard" ? "Government Dashboard" : activeSection === "profile" ? "My Profile" : comingSoonTitles[activeSection]}</h1>
            <span>Monitor, coordinate and respond to community relief operations.</span>
          </div>

          <div className="government-topbar-actions">
            <button
              className="government-refresh-btn"
              onClick={loadDashboard}
              disabled={loading}
              title="Refresh dashboard"
            >
              <FaSyncAlt className={loading ? "government-spin" : ""} />
              Refresh
            </button>
            <button className="government-user-chip" onClick={openProfile}>
              <span className="government-user-avatar"><FaUser /></span>
              <span>
                <strong>{user.fullName || "Government Officer"}</strong>
                <small>Government Officer</small>
              </span>
            </button>
          </div>
        </header>

        {activeSection === "emergencies" && (
          <GovernmentEmergencies
            onBack={() => setActiveSection("dashboard")}
          />
        )}

        {activeSection === "assistance" && (
          <GovernmentAssistance
            onBack={() => setActiveSection("dashboard")}
          />
        )}

        {activeSection === "dashboard" && (
          <section className="government-dashboard-content">
            {error && (
              <div className="government-alert error">
                <FaTimes />
                <span>{error}</span>
              </div>
            )}

            <div className="government-live-banner">
              <div className="government-live-dot" />
              <div>
                <strong>Response network active</strong>
                <span>
                  {lastUpdated
                    ? `Last updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                    : "Loading current response statistics..."}
                </span>
              </div>
              <div className="government-banner-actions">
                <button onClick={() => setActiveSection("emergencies")}>
                  Review Emergencies <FaArrowRight />
                </button>
              </div>
            </div>

            <div className="government-stat-grid">
              {statCards.map((card) => (
                <div className="government-stat-card" key={card.label}>
                  <div className={`government-stat-icon ${card.tone}`}>{card.icon}</div>
                  <div>
                    <span>{card.label}</span>
                    <strong>{loading ? "—" : card.value}</strong>
                  </div>
                </div>
              ))}
            </div>

            <div className="government-dashboard-grid">
              <section className="government-panel government-chart-panel">
                <div className="government-panel-heading">
                  <div>
                    <h2>Response Requests</h2>
                    <p>Current emergency and assistance workload.</p>
                  </div>
                </div>
                <div className="government-chart-area">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </section>

              <section className="government-panel government-chart-panel">
                <div className="government-panel-heading">
                  <div>
                    <h2>Response Activity</h2>
                    <p>Overview of current relief activity.</p>
                  </div>
                </div>
                <div className="government-doughnut-area">
                  <Doughnut
                    data={responseChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: "65%",
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: { usePointStyle: true, boxWidth: 8 },
                        },
                      },
                    }}
                  />
                  <div className="government-doughnut-center">
                    <strong>{stats.peopleHelped}</strong>
                    <span>People Helped</span>
                  </div>
                </div>
              </section>
            </div>

            <div className="government-bottom-grid">
              <section className="government-panel government-overview-panel">
                <div className="government-panel-heading">
                  <div>
                    <h2>Relief Network Overview</h2>
                    <p>Resources currently registered in the platform.</p>
                  </div>
                </div>

                <div className="government-network-list">
                  <div><FaUsers /><span>Volunteers</span><strong>{stats.volunteers}</strong></div>
                  <div><FaBuilding /><span>NGOs</span><strong>{stats.ngos}</strong></div>
                  <div><FaCampground /><span>Relief Camps</span><strong>{stats.reliefCamps}</strong></div>
                  <div><FaDonate /><span>Donations</span><strong>{stats.donations}</strong></div>
                  <div><FaHandsHelping /><span>NGO Contributions</span><strong>{stats.ngoContributions}</strong></div>
                </div>
              </section>

              <section className="government-panel government-finance-panel">
                <div className="government-panel-heading">
                  <div>
                    <h2>Relief Funding</h2>
                    <p>Recorded monetary support.</p>
                  </div>
                </div>

                <div className="government-money-row">
                  <div>
                    <span>Donations</span>
                    <strong>{formatMoney(stats.donationAmount)}</strong>
                  </div>
                  <div>
                    <span>NGO Contributions</span>
                    <strong>{formatMoney(stats.ngoContributionAmount)}</strong>
                  </div>
                </div>

                <div className="government-helped-box">
                  <FaCheckCircle />
                  <div>
                    <strong>{stats.peopleHelped} people helped</strong>
                    <span>Based on resolved emergencies and fulfilled assistance requests.</span>
                  </div>
                </div>
              </section>
            </div>
          </section>
        )}

        {activeSection === "operations" && (
          <GovernmentOperations onBack={() => setActiveSection("dashboard")} />
        )}

        {activeSection === "ngos" && (
          <GovernmentNGOs onBack={() => setActiveSection("dashboard")} />
        )}

        {activeSection === "volunteers" && (
          <GovernmentVolunteers onBack={() => setActiveSection("dashboard")} />
        )}

        {activeSection === "camps" && (
          <GovernmentCamps onBack={() => setActiveSection("dashboard")} />
        )}

        {activeSection === "donations" && (
          <GovernmentDonations onBack={() => setActiveSection("dashboard")} />
        )}

        {activeSection === "distribution" && (
          <GovernmentDistribution onBack={() => setActiveSection("dashboard")} />
        )}

        {activeSection === "map" && (
          <GovernmentResponseMap onBack={() => setActiveSection("dashboard")} />
        )}

        {activeSection === "reports" && (
          <GovernmentReports onBack={() => setActiveSection("dashboard")} />
        )}

        {activeSection === "profile" && (
          <section className="government-profile-section">
            <div className="government-panel government-profile-panel">
              <div className="government-profile-header">
                <div className="government-profile-avatar"><FaUser /></div>
                <div>
                  <h2>{user.fullName || "Government Officer"}</h2>
                  <span>{user.role || "Government"}</span>
                </div>
              </div>

              {profileMessage && <div className="government-alert success"><FaCheckCircle /> {profileMessage}</div>}
              {profileError && <div className="government-alert error"><FaTimes /> {profileError}</div>}

              {!profileEditing ? (
                <>
                  <div className="government-profile-grid">
                    <div><span>Full Name</span><strong>{user.fullName || "-"}</strong></div>
                    <div><span>Email</span><strong>{user.email || "-"}</strong></div>
                    <div><span>Phone</span><strong>{user.phone || "-"}</strong></div>
                    <div><span>Role</span><strong>{user.role || "Government"}</strong></div>
                    <div className="full"><span>Address</span><strong>{user.address || "-"}</strong></div>
                  </div>
                  <div className="government-profile-action-row">
                    <button className="government-primary-btn" onClick={() => setProfileEditing(true)}>
                      Edit Profile
                    </button>
                    <button
                      type="button"
                      className="government-secondary-btn government-password-toggle"
                      onClick={() => {
                        setShowPasswordSection((value) => !value);
                        setPasswordMessage("");
                        setPasswordError("");
                      }}
                    >
                      <FaKey />
                      {showPasswordSection ? "Hide Change Password" : "Change Password"}
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleProfileSave} className="government-profile-form">
                  <div>
                    <label>Full Name</label>
                    <input name="fullName" value={profileForm.fullName} onChange={handleProfileChange} required />
                  </div>
                  <div>
                    <label>Phone</label>
                    <input name="phone" value={profileForm.phone} onChange={handleProfileChange} />
                  </div>
                  <div className="full">
                    <label>Address</label>
                    <textarea name="address" rows="4" value={profileForm.address} onChange={handleProfileChange} />
                  </div>
                  <div className="government-form-actions full">
                    <button type="button" className="government-secondary-btn" onClick={() => setProfileEditing(false)}>Cancel</button>
                    <button type="submit" className="government-primary-btn" disabled={profileSaving}>
                      {profileSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}

              {showPasswordSection && (
                <div className="government-password-panel">
                  <div className="government-password-heading">
                    <div className="government-password-icon"><FaKey /></div>
                    <div>
                      <h3>Change Password</h3>
                      <p>Update your Government Portal login password securely.</p>
                    </div>
                  </div>

                  {passwordMessage && (
                    <div className="government-alert success"><FaCheckCircle /> {passwordMessage}</div>
                  )}
                  {passwordError && (
                    <div className="government-alert error"><FaTimes /> {passwordError}</div>
                  )}

                  <form onSubmit={handlePasswordSave} className="government-password-form">
                    <div>
                      <label>Current Password</label>
                      <div className="government-password-input-wrap">
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          name="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordChange}
                          autoComplete="current-password"
                          required
                        />
                        <button type="button" onClick={() => setShowPasswords((value) => ({ ...value, current: !value.current }))} aria-label="Show or hide current password">
                          {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label>New Password</label>
                      <div className="government-password-input-wrap">
                        <input
                          type={showPasswords.next ? "text" : "password"}
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                          autoComplete="new-password"
                          minLength={6}
                          required
                        />
                        <button type="button" onClick={() => setShowPasswords((value) => ({ ...value, next: !value.next }))} aria-label="Show or hide new password">
                          {showPasswords.next ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label>Confirm New Password</label>
                      <div className="government-password-input-wrap">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                          autoComplete="new-password"
                          minLength={6}
                          required
                        />
                        <button type="button" onClick={() => setShowPasswords((value) => ({ ...value, confirm: !value.confirm }))} aria-label="Show or hide confirm password">
                          {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <div className="government-password-actions">
                      <button
                        type="button"
                        className="government-secondary-btn"
                        onClick={() => {
                          setShowPasswordSection(false);
                          setPasswordMessage("");
                          setPasswordError("");
                        }}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="government-primary-btn" disabled={passwordSaving}>
                        {passwordSaving ? "Changing..." : "Change Password"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default Government;
