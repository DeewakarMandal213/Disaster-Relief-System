import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import ReliefCamps from "./ReliefCamps";
import DisasterMap from "./DisasterMap";

import {
  FaHome,
  FaExclamationTriangle,
  FaHandHoldingHeart,
  FaMapMarkedAlt,
  FaClipboardList,
  FaUser,
  FaUserCircle,
  FaEdit,
  FaSignOutAlt,
  FaBell,
  FaUtensils,
  FaMedkit,
  FaTint,
  FaUsers,
  FaArrowRight,
  FaFire,
  FaWater,
  FaHouseDamage,
  FaHome as FaShelter,
  FaBoxOpen,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
} from "react-icons/fa";

import "./Citizen.css";

function Citizen() {
  const navigate = useNavigate();

  const {
    user,
    logout,
    updateProfile,
  } = useAuth();

  const [activeMenu, setActiveMenu] =
    useState("Dashboard");

  // =========================================================
  // DASHBOARD DATA
  // =========================================================

  const [dashboardStats, setDashboardStats] = useState({
    totalRequests: 0,
    activeRequests: 0,
    nearbyVolunteers: 0,
    reliefCamps: 0,
    volunteers: 0,
    activeAlerts: 0,
  });

  const [recentRequests, setRecentRequests] =
    useState([]);

  const [dashboardLoading, setDashboardLoading] =
    useState(false);

  const [dashboardError, setDashboardError] =
    useState("");

  // =========================================================
  // MY REQUESTS DATA
  // =========================================================

  const [myEmergencies, setMyEmergencies] =
    useState([]);

  const [myAssistances, setMyAssistances] =
    useState([]);

  const [myRequestsLoading, setMyRequestsLoading] =
    useState(false);

  const [myRequestsError, setMyRequestsError] =
    useState("");

  // =========================================================
  // PROFILE DATA
  // =========================================================

  const [profileEditing, setProfileEditing] =
    useState(false);

  const [profileSaving, setProfileSaving] =
    useState(false);

  const [profileMessage, setProfileMessage] =
    useState(null);

  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phone: "",
    address: "",
  });

  // =========================================================
  // CHANGE PASSWORD DATA
  // =========================================================

  const [passwordEditing, setPasswordEditing] =
    useState(false);

  const [passwordSaving, setPasswordSaving] =
    useState(false);

  const [passwordMessage, setPasswordMessage] =
    useState(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // =========================================================
  // SYNC PROFILE FORM WITH LOGGED-IN USER
  // =========================================================

  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user]);

  // =========================================================
  // FETCH CITIZEN DASHBOARD
  // =========================================================

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchDashboard = async () => {
      try {
        setDashboardLoading(true);
        setDashboardError("");

        const response = await API.get(
          "/dashboard/citizen"
        );

        const data = response.data;

        setDashboardStats(
          data.stats || {
            totalRequests: 0,
            activeRequests: 0,
            nearbyVolunteers: 0,
            reliefCamps: 0,
            volunteers: 0,
            activeAlerts: 0,
          }
        );

        setRecentRequests(
          data.recentRequests || []
        );

        // Keep request lists synchronized
        // with dashboard response.
        if (data.requests) {
          setMyEmergencies(
            data.requests.emergencies || []
          );

          setMyAssistances(
            data.requests.assistances || []
          );
        }
      } catch (error) {
        console.error(
          "Failed to fetch citizen dashboard:",
          error
        );

        setDashboardError(
          error.response?.data?.message ||
            "Failed to load dashboard data."
        );
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchDashboard();
  }, [user]);

  // =========================================================
  // FETCH MY REQUESTS
  // =========================================================

  useEffect(() => {
    if (
      activeMenu !== "My Requests" &&
      activeMenu !== "Dashboard"
    ) {
      return;
    }

    const fetchMyRequests = async () => {
      try {
        setMyRequestsLoading(true);
        setMyRequestsError("");

        const [
          emergencyResponse,
          assistanceResponse,
        ] = await Promise.all([
          API.get("/emergencies/my"),
          API.get("/assistance/my"),
        ]);

        setMyEmergencies(
          emergencyResponse.data.emergencies || []
        );

        setMyAssistances(
          assistanceResponse.data.assistances || []
        );
      } catch (error) {
        console.error(
          "Failed to fetch my requests:",
          error
        );

        setMyRequestsError(
          error.response?.data?.message ||
            "Failed to load your requests."
        );
      } finally {
        setMyRequestsLoading(false);
      }
    };

    fetchMyRequests();
  }, [activeMenu]);

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // =========================================================
  // SAVE PROFILE
  // =========================================================

  const handleProfileSave = async () => {
    try {
      setProfileSaving(true);
      setProfileMessage(null);

      if (!profileForm.fullName.trim()) {
        setProfileMessage({
          type: "error",
          text: "Full name is required.",
        });

        setProfileSaving(false);
        return;
      }

      const updatedUser = await updateProfile({
        fullName:
          profileForm.fullName.trim(),

        phone:
          profileForm.phone.trim(),

        address:
          profileForm.address.trim(),
      });

      setProfileForm({
        fullName:
          updatedUser?.fullName || "",

        phone:
          updatedUser?.phone || "",

        address:
          updatedUser?.address || "",
      });

      setProfileEditing(false);

      setProfileMessage({
        type: "success",
        text: "Profile updated successfully.",
      });
    } catch (error) {
      console.error(
        "Failed to update profile:",
        error
      );

      setProfileMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Failed to update profile.",
      });
    } finally {
      setProfileSaving(false);
    }
  };

  // =========================================================
  // EMERGENCY ICON
  // =========================================================

  const getEmergencyIcon = (type) => {
    switch (type) {
      case "Flood":
        return <FaWater />;

      case "Fire":
        return <FaFire />;

      case "Building Damage":
        return <FaHouseDamage />;

      default:
        return <FaExclamationTriangle />;
    }
  };

  // =========================================================
  // ASSISTANCE ICON
  // =========================================================

  const getAssistanceIcon = (type) => {
    switch (type) {
      case "Food":
        return <FaUtensils />;

      case "Water":
        return <FaTint />;

      case "Medical Help":
        return <FaMedkit />;

      case "Shelter":
        return <FaShelter />;

      case "Essential Supplies":
        return <FaBoxOpen />;

      default:
        return <FaHandHoldingHeart />;
    }
  };

  // =========================================================
  // STATUS CLASS
  // =========================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "pending";

      case "Acknowledged":
        return "progress";

      case "In Progress":
        return "progress";

      case "Resolved":
        return "completed";

      case "Fulfilled":
        return "completed";

      case "Rejected":
        return "rejected";

      default:
        return "pending";
    }
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "Date unavailable";
    }

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =========================================================
  // CHANGE PASSWORD
  // =========================================================

  const handlePasswordSave = async () => {
    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "Please fill in all password fields.",
      });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({
        type: "error",
        text: "New password must contain at least 6 characters.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "New password and confirmation password do not match.",
      });
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordMessage({
        type: "error",
        text: "New password must be different from your current password.",
      });
      return;
    }

    try {
      setPasswordSaving(true);
      setPasswordMessage(null);

      const response = await API.put(
        "/auth/change-password",
        {
          currentPassword,
          newPassword,
        }
      );

      setPasswordMessage({
        type: "success",
        text:
          response.data?.message ||
          "Password changed successfully.",
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      console.error("Change password error:", error);

      setPasswordMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Failed to change password.",
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  const openPasswordEditor = () => {
    setProfileEditing(false);
    setPasswordEditing(true);
    setPasswordMessage(null);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const cancelPasswordEditor = () => {
    setPasswordEditing(false);
    setPasswordMessage(null);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  // =========================================================
  // RENDER SECTION
  // =========================================================

  const renderSection = () => {
    switch (activeMenu) {

      // =====================================================
      // REPORT EMERGENCY
      // =====================================================

      case "Report Emergency":
        return (
          <div className="citizen-placeholder">

            <h2>🚨 Report Emergency</h2>

            <p>
              Report a disaster or emergency situation
              and request immediate assistance.
            </p>

            <button
              className="sos-btn"
              onClick={() =>
                navigate(
                  "/citizen/report-emergency"
                )
              }
            >
              Report Emergency
            </button>

          </div>
        );

      // =====================================================
      // REQUEST ASSISTANCE
      // =====================================================

      case "Request Assistance":
        return (
          <div className="citizen-placeholder">

            <h2>🤝 Request Assistance</h2>

            <p>
              Request food, water, medical help,
              shelter, or other essential assistance.
            </p>

            <button
              className="sos-btn"
              onClick={() =>
                navigate(
                  "/citizen/request-assistance"
                )
              }
            >
              Request Assistance
            </button>

          </div>
        );

      // =====================================================
      // RELIEF CAMPS
      // =====================================================

      case "Relief Camps":
        return (
          <ReliefCamps
            onBack={() => setActiveMenu("Dashboard")}
          />
        );

      // =====================================================
      // DISASTER MAP
      // =====================================================

      case "Disaster Map":
        return (
          <DisasterMap
            onBack={() => setActiveMenu("Dashboard")}
          />
        );

      // =====================================================
      // MY REQUESTS
      // =====================================================

      case "My Requests": {
        const totalRequests =
          myEmergencies.length +
          myAssistances.length;

        return (
          <div className="citizen-my-requests">

            <div className="citizen-section-header">

              <div>

                <p className="dashboard-label">
                  REQUEST MANAGEMENT
                </p>

                <h1>
                  My Requests
                </h1>

                <p>
                  View and track your emergency
                  reports and assistance requests.
                </p>

              </div>

              <div className="my-request-count">

                <FaClipboardList />

                <span>
                  {totalRequests}
                </span>

                <small>
                  Total Requests
                </small>

              </div>

            </div>

            {myRequestsLoading && (
              <div className="citizen-placeholder">

                <h2>
                  ⏳ Loading your requests...
                </h2>

                <p>
                  Please wait while we retrieve
                  your requests.
                </p>

              </div>
            )}

            {!myRequestsLoading &&
              myRequestsError && (
                <div className="citizen-placeholder">

                  <h2>
                    ⚠️ Unable to load requests
                  </h2>

                  <p>
                    {myRequestsError}
                  </p>

                </div>
              )}

            {!myRequestsLoading &&
              !myRequestsError &&
              totalRequests === 0 && (
                <div className="citizen-placeholder">

                  <h2>
                    📋 No Requests Yet
                  </h2>

                  <p>
                    You have not submitted any
                    emergency reports or assistance
                    requests yet.
                  </p>

                  <button
                    className="sos-btn"
                    onClick={() =>
                      navigate(
                        "/citizen/report-emergency"
                      )
                    }
                  >
                    Report Emergency
                  </button>

                </div>
              )}

            {/* =================================================
                EMERGENCY REQUESTS
            ================================================= */}

            {!myRequestsLoading &&
              !myRequestsError &&
              myEmergencies.length > 0 && (
                <section className="my-request-section">

                  <div className="citizen-section-header">

                    <div>

                      <h2>
                        Emergency Requests
                      </h2>

                      <p>
                        Disaster and emergency
                        reports submitted by you.
                      </p>

                    </div>

                    <div className="my-request-count">

                      <FaExclamationTriangle />

                      <span>
                        {myEmergencies.length}
                      </span>

                      <small>
                        Emergency Reports
                      </small>

                    </div>

                  </div>

                  <div className="my-requests-list">

                    {myEmergencies.map(
                      (emergency) => (
                        <div
                          className="dashboard-card my-request-card"
                          key={`emergency-${emergency._id}`}
                        >

                          <div className="my-request-top">

                            <div className="my-request-title">

                              <div className="request-icon">
                                {getEmergencyIcon(
                                  emergency.emergencyType
                                )}
                              </div>

                              <div>

                                <h2>
                                  {
                                    emergency.emergencyType
                                  }
                                </h2>

                                <span>
                                  Emergency ID:{" "}
                                  {emergency._id
                                    ?.slice(-8)
                                    .toUpperCase()}
                                </span>

                              </div>

                            </div>

                            <span
                              className={`status ${getStatusClass(
                                emergency.status
                              )}`}
                            >
                              {emergency.status}
                            </span>

                          </div>

                          <div className="my-request-details">

                            <div>

                              <strong>
                                Severity
                              </strong>

                              <span>
                                {emergency.severity}
                              </span>

                            </div>

                            <div>

                              <strong>
                                Location
                              </strong>

                              <span>
                                {emergency.location}
                              </span>

                            </div>

                            <div>

                              <strong>
                                Contact
                              </strong>

                              <span>
                                {emergency.contactNumber ||
                                  "Not provided"}
                              </span>

                            </div>

                            <div>

                              <strong>
                                Submitted
                              </strong>

                              <span>
                                {formatDate(
                                  emergency.createdAt
                                )}
                              </span>

                            </div>

                          </div>

                          {emergency.description && (
                            <div className="my-request-description">

                              <strong>
                                Description
                              </strong>

                              <p>
                                {
                                  emergency.description
                                }
                              </p>

                            </div>
                          )}

                        </div>
                      )
                    )}

                  </div>

                </section>
              )}

            {/* =================================================
                ASSISTANCE REQUESTS
            ================================================= */}

            {!myRequestsLoading &&
              !myRequestsError &&
              myAssistances.length > 0 && (
                <section className="my-request-section">

                  <div className="citizen-section-header">

                    <div>

                      <h2>
                        Assistance Requests
                      </h2>

                      <p>
                        Food, water, medical,
                        shelter, and essential supply
                        requests submitted by you.
                      </p>

                    </div>

                    <div className="my-request-count">

                      <FaHandHoldingHeart />

                      <span>
                        {myAssistances.length}
                      </span>

                      <small>
                        Assistance Requests
                      </small>

                    </div>

                  </div>

                  <div className="my-requests-list">

                    {myAssistances.map(
                      (assistance) => (
                        <div
                          className="dashboard-card my-request-card"
                          key={`assistance-${assistance._id}`}
                        >

                          <div className="my-request-top">

                            <div className="my-request-title">

                              <div className="request-icon">
                                {getAssistanceIcon(
                                  assistance.assistanceType
                                )}
                              </div>

                              <div>

                                <h2>
                                  {
                                    assistance.assistanceType
                                  }
                                </h2>

                                <span>
                                  Assistance ID:{" "}
                                  {assistance._id
                                    ?.slice(-8)
                                    .toUpperCase()}
                                </span>

                              </div>

                            </div>

                            <span
                              className={`status ${getStatusClass(
                                assistance.status
                              )}`}
                            >
                              {assistance.status}
                            </span>

                          </div>

                          <div className="my-request-details">

                            <div>

                              <strong>
                                Priority
                              </strong>

                              <span>
                                {assistance.priority}
                              </span>

                            </div>

                            <div>

                              <strong>
                                Location
                              </strong>

                              <span>
                                {assistance.location}
                              </span>

                            </div>

                            <div>

                              <strong>
                                Contact
                              </strong>

                              <span>
                                {assistance.contactNumber ||
                                  "Not provided"}
                              </span>

                            </div>

                            <div>

                              <strong>
                                Submitted
                              </strong>

                              <span>
                                {formatDate(
                                  assistance.createdAt
                                )}
                              </span>

                            </div>

                          </div>

                          {assistance.description && (
                            <div className="my-request-description">

                              <strong>
                                Additional Details
                              </strong>

                              <p>
                                {
                                  assistance.description
                                }
                              </p>

                            </div>
                          )}

                        </div>
                      )
                    )}

                  </div>

                </section>
              )}

          </div>
        );
      }

      // =====================================================
      // PROFILE
      // =====================================================

      case "Profile":
        return (
          <div className="citizen-profile-section">

            <div className="profile-header">

              <div>
                <p className="dashboard-label">ACCOUNT SETTINGS</p>

                <h1>
                  <FaUserCircle /> My Profile
                </h1>

                <p>
                  View and manage your ReliefConnect citizen profile.
                </p>
              </div>

              {!profileEditing && !passwordEditing && (
                <div className="profile-header-actions">
                  <button
                    className="profile-secondary-btn"
                    onClick={openPasswordEditor}
                  >
                    <FaLock />
                    Change Password
                  </button>

                  <button
                    className="profile-edit-btn"
                    onClick={() => {
                      setProfileMessage(null);
                      setPasswordMessage(null);
                      setProfileForm({
                        fullName: user?.fullName || "",
                        phone: user?.phone || "",
                        address: user?.address || "",
                      });
                      setProfileEditing(true);
                    }}
                  >
                    <FaEdit />
                    Edit Profile
                  </button>
                </div>
              )}

            </div>

            {profileMessage && (
              <div
                className={`profile-message ${
                  profileMessage.type === "success"
                    ? "profile-message-success"
                    : "profile-message-error"
                }`}
              >
                {profileMessage.text}
              </div>
            )}

            {passwordMessage && (
              <div
                className={`profile-message ${
                  passwordMessage.type === "success"
                    ? "profile-message-success"
                    : "profile-message-error"
                }`}
              >
                {passwordMessage.text}
              </div>
            )}

            {!passwordEditing && (
              <>
                <div className="profile-card">
                  <div className="profile-avatar">
                    <FaUser />
                  </div>

                  <div className="profile-details">
                    <div className="profile-field">
                      <label>Full Name</label>
                      {profileEditing ? (
                        <input
                          type="text"
                          value={profileForm.fullName}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, fullName: e.target.value })
                          }
                          placeholder="Enter your full name"
                        />
                      ) : (
                        <p>{user?.fullName || "Not provided"}</p>
                      )}
                    </div>

                    <div className="profile-field">
                      <label>Email Address</label>
                      <p>{user?.email || "Not provided"}</p>
                      <small>Email address cannot be changed from the profile section.</small>
                    </div>

                    <div className="profile-field">
                      <label>Phone Number</label>
                      {profileEditing ? (
                        <input
                          type="text"
                          value={profileForm.phone}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, phone: e.target.value })
                          }
                          placeholder="Enter your phone number"
                        />
                      ) : (
                        <p>{user?.phone || "Not provided"}</p>
                      )}
                    </div>

                    <div className="profile-field">
                      <label>Address</label>
                      {profileEditing ? (
                        <textarea
                          rows="4"
                          value={profileForm.address}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, address: e.target.value })
                          }
                          placeholder="Enter your address"
                        />
                      ) : (
                        <p>{user?.address || "Not provided"}</p>
                      )}
                    </div>

                    <div className="profile-field">
                      <label>Account Role</label>
                      <p>{user?.role || "Citizen"}</p>
                    </div>
                  </div>
                </div>

                {profileEditing && (
                  <div className="profile-actions">
                    <button
                      className="profile-cancel-btn"
                      onClick={() => {
                        setProfileEditing(false);
                        setProfileForm({
                          fullName: user?.fullName || "",
                          phone: user?.phone || "",
                          address: user?.address || "",
                        });
                        setProfileMessage(null);
                      }}
                      disabled={profileSaving}
                    >
                      Cancel
                    </button>

                    <button
                      className="profile-save-btn"
                      onClick={handleProfileSave}
                      disabled={profileSaving}
                    >
                      {profileSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}
              </>
            )}

            {passwordEditing && (
              <section className="password-card">
                <div className="password-card-header">
                  <div className="password-card-icon"><FaLock /></div>
                  <div>
                    <h2>Change Password</h2>
                    <p>Keep your citizen account secure with a strong password.</p>
                  </div>
                </div>

                <div className="password-fields-grid">
                  {[
                    ["Current Password", "currentPassword", showCurrentPassword, setShowCurrentPassword, "Enter current password"],
                    ["New Password", "newPassword", showNewPassword, setShowNewPassword, "Enter new password"],
                    ["Confirm New Password", "confirmPassword", showConfirmPassword, setShowConfirmPassword, "Re-enter new password"],
                  ].map(([label, name, visible, setVisible, placeholder]) => (
                    <div className="profile-field password-field" key={name}>
                      <label>{label}</label>
                      <div className="password-input-wrapper">
                        <input
                          type={visible ? "text" : "password"}
                          value={passwordForm[name]}
                          onChange={(e) => {
                            setPasswordForm({ ...passwordForm, [name]: e.target.value });
                            setPasswordMessage(null);
                          }}
                          placeholder={placeholder}
                          autoComplete={name === "currentPassword" ? "current-password" : "new-password"}
                          minLength={name === "currentPassword" ? undefined : 6}
                        />
                        <button
                          type="button"
                          className="password-visibility-btn"
                          onClick={() => setVisible(!visible)}
                          title={visible ? "Hide password" : "Show password"}
                        >
                          {visible ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {name === "newPassword" && <small>Minimum 6 characters.</small>}
                    </div>
                  ))}
                </div>

                <div className="password-security-note">
                  <FaShieldAlt />
                  <div>
                    <strong>Password security</strong>
                    <p>Never share your password with anyone. Your password is securely encrypted before being stored.</p>
                  </div>
                </div>

                <div className="profile-actions">
                  <button
                    className="profile-cancel-btn"
                    onClick={cancelPasswordEditor}
                    disabled={passwordSaving}
                  >
                    Cancel
                  </button>
                  <button
                    className="profile-password-save-btn"
                    onClick={handlePasswordSave}
                    disabled={passwordSaving}
                  >
                    <FaLock />
                    {passwordSaving ? "Changing..." : "Change Password"}
                  </button>
                </div>
              </section>
            )}

          </div>
        );

      // =====================================================
      // DASHBOARD
      // =====================================================

      case "Dashboard":
      default:
        return null;
    }
  };

  // =========================================================
  // SIDEBAR MENU
  // =========================================================

  const menuItems = [
    {
      name: "Dashboard",
      icon: <FaHome />,
    },
    {
      name: "Report Emergency",
      icon: <FaExclamationTriangle />,
    },
    {
      name: "Request Assistance",
      icon: <FaHandHoldingHeart />,
    },
    {
      name: "Relief Camps",
      icon: <FaMapMarkedAlt />,
    },
    {
      name: "Disaster Map",
      icon: <FaMapMarkedAlt />,
    },
    {
      name: "My Requests",
      icon: <FaClipboardList />,
    },
    {
      name: "Profile",
      icon: <FaUser />,
    },
  ];

  // =========================================================
  // QUICK ACTIONS
  // =========================================================

  const quickActions = [
    {
      title: "Report Emergency",
      description:
        "Report a disaster or emergency situation.",
      icon: <FaExclamationTriangle />,
      className: "emergency",
    },
    {
      title: "Request Food",
      description:
        "Request food and essential supplies.",
      icon: <FaUtensils />,
      className: "food",
    },
    {
      title: "Medical Help",
      description:
        "Request immediate medical assistance.",
      icon: <FaMedkit />,
      className: "medical",
    },
    {
      title: "Find Relief Camp",
      description:
        "Locate nearby relief camps and shelters.",
      icon: <FaMapMarkedAlt />,
      className: "camp",
    },
  ];

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="citizen-dashboard">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="citizen-sidebar">

        <div className="citizen-logo">

          <div className="citizen-logo-icon">
            RC
          </div>

          <div>

            <h2>
              Relief<span>Connect</span>
            </h2>

            <p>
              Citizen Portal
            </p>

          </div>

        </div>

        <nav className="citizen-navigation">

          {menuItems.map((item) => (
            <button
              key={item.name}
              className={
                activeMenu === item.name
                  ? "citizen-menu active"
                  : "citizen-menu"
              }
              onClick={() => {

                if (
                  item.name ===
                  "Report Emergency"
                ) {

                  navigate(
                    "/citizen/report-emergency"
                  );

                } else if (
                  item.name ===
                  "Request Assistance"
                ) {

                  navigate(
                    "/citizen/request-assistance"
                  );

                } else {

                  setActiveMenu(
                    item.name
                  );

                }

              }}
            >

              <span className="menu-icon">
                {item.icon}
              </span>

              <span>
                {item.name}
              </span>

            </button>
          ))}

        </nav>

        <button
          className="citizen-logout"
          onClick={handleLogout}
        >
          <FaSignOutAlt />
          Logout
        </button>

      </aside>

      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <main className="citizen-main">

        {activeMenu === "Dashboard" ? (
          <>

            {/* =================================================
                TOP BAR
            ================================================= */}

            <header className="citizen-topbar">

              <div>

                <p className="dashboard-label">
                  CITIZEN DASHBOARD
                </p>

                <h1>
                  Welcome back
                  {user?.fullName
                    ? `, ${user.fullName}`
                    : ""}!
                  👋
                </h1>

              </div>

              <button
                className="notification-btn"
                onClick={() => {
                  // Notifications will be connected
                  // to the notification system later.
                }}
              >

                <FaBell />

                <span></span>

              </button>

            </header>

            {/* =================================================
                DASHBOARD ERROR
            ================================================= */}

            {dashboardError && (
              <div className="citizen-placeholder">

                <h2>
                  ⚠️ Dashboard data unavailable
                </h2>

                <p>
                  {dashboardError}
                </p>

              </div>
            )}

            {/* =================================================
                ALERT
            ================================================= */}

            <section className="citizen-alert">

              <div className="alert-icon">
                <FaExclamationTriangle />
              </div>

              <div className="alert-content">

                <h3>
                  Emergency Assistance
                </h3>

                <p>
                  If you are in immediate danger,
                  use the emergency button to request
                  urgent assistance.
                </p>

              </div>

              <button
                className="sos-btn"
                onClick={() =>
                  navigate(
                    "/citizen/report-emergency"
                  )
                }
              >
                SOS
              </button>

            </section>

            {/* =================================================
                STATISTICS
            ================================================= */}

            <section className="citizen-stats">

              <div className="citizen-stat-card">

                <div className="stat-icon blue">
                  <FaClipboardList />
                </div>

                <div>

                  <p>
                    My Requests
                  </p>

                  <h2>
                    {dashboardLoading
                      ? "..."
                      : dashboardStats.totalRequests}
                  </h2>

                </div>

              </div>

              <div className="citizen-stat-card">

                <div className="stat-icon orange">
                  <FaHandHoldingHeart />
                </div>

                <div>

                  <p>
                    Active Requests
                  </p>

                  <h2>
                    {dashboardLoading
                      ? "..."
                      : dashboardStats.activeRequests}
                  </h2>

                </div>

              </div>

              <div className="citizen-stat-card">

                <div className="stat-icon green">
                  <FaUsers />
                </div>

                <div>

                  <p>
                    Nearby Volunteers
                  </p>

                  <h2>
                    {dashboardLoading
                      ? "..."
                      : dashboardStats.nearbyVolunteers}
                  </h2>

                </div>

              </div>

              <div className="citizen-stat-card">

                <div className="stat-icon red">
                  <FaExclamationTriangle />
                </div>

                <div>

                  <p>
                    Active Alerts
                  </p>

                  <h2>
                    {dashboardLoading
                      ? "..."
                      : dashboardStats.activeAlerts}
                  </h2>

                </div>

              </div>

            </section>

            {/* =================================================
                QUICK ACTIONS
            ================================================= */}

            <section className="citizen-section">

              <div className="section-heading">

                <div>

                  <h2>
                    Quick Actions
                  </h2>

                  <p>
                    Get the help you need quickly.
                  </p>

                </div>

              </div>

              <div className="quick-actions">

                {quickActions.map(
                  (action) => (
                    <button
                      key={action.title}
                      className={`quick-action-card ${action.className}`}
                      onClick={() => {

                        if (
                          action.title ===
                          "Report Emergency"
                        ) {

                          navigate(
                            "/citizen/report-emergency"
                          );

                        } else if (
                          action.title ===
                          "Request Food"
                        ) {

                          navigate(
                            "/citizen/request-assistance"
                          );

                        } else if (
                          action.title ===
                          "Medical Help"
                        ) {

                          navigate(
                            "/citizen/request-assistance"
                          );

                        } else if (
                          action.title ===
                          "Find Relief Camp"
                        ) {

                          setActiveMenu(
                            "Relief Camps"
                          );

                        }

                      }}
                    >

                      <div className="quick-action-icon">
                        {action.icon}
                      </div>

                      <div className="quick-action-content">

                        <h3>
                          {action.title}
                        </h3>

                        <p>
                          {action.description}
                        </p>

                      </div>

                      <FaArrowRight
                        className="quick-arrow"
                      />

                    </button>
                  )
                )}

              </div>

            </section>

            {/* =================================================
                LOWER GRID
            ================================================= */}

            <section className="citizen-lower-grid">

              {/* =================================================
                  RECENT REQUESTS
              ================================================= */}

              <div className="dashboard-card requests-card">

                <div className="card-heading">

                  <div>

                    <h2>
                      Recent Requests
                    </h2>

                    <p>
                      Your latest assistance requests
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      setActiveMenu(
                        "My Requests"
                      )
                    }
                  >
                    View All
                  </button>

                </div>

                <div className="request-list">

                  {dashboardLoading ? (
                    <div className="request-empty">
                      <p>
                        Loading recent requests...
                      </p>
                    </div>
                  ) : recentRequests.length > 0 ? (
                    recentRequests.map(
                      (request) => {

                        const isEmergency =
                          request.type ===
                          "Emergency";

                        const title =
                          request.title ||
                          "Request";

                        const id =
                          request._id
                            ?.slice(-8)
                            .toUpperCase();

                        return (
                          <div
                            className="request-row"
                            key={`${request.type}-${request._id}`}
                          >

                            <div className="request-icon">

                              {isEmergency
                                ? getEmergencyIcon(
                                    request.title
                                  )
                                : getAssistanceIcon(
                                    request.title
                                  )}

                            </div>

                            <div className="request-info">

                              <strong>
                                {title}
                              </strong>

                              <span>
                                {isEmergency
                                  ? "Emergency #"
                                  : "Request #"}
                                {id}
                              </span>

                            </div>

                            <span
                              className={`status ${getStatusClass(
                                request.status
                              )}`}
                            >
                              {request.status}
                            </span>

                          </div>
                        );
                      }
                    )
                  ) : (
                    <div className="request-empty">

                      <p>
                        No requests submitted yet.
                      </p>

                      <button
                        onClick={() =>
                          navigate(
                            "/citizen/request-assistance"
                          )
                        }
                      >
                        Create Request
                      </button>

                    </div>
                  )}

                </div>

              </div>

              {/* =================================================
                  DISASTER STATUS
              ================================================= */}

              <div className="dashboard-card disaster-card">

                <div className="card-heading">

                  <div>

                    <h2>
                      Disaster Status
                    </h2>

                    <p>
                      Current situation
                    </p>

                  </div>

                  <span className="live-status">
                    ● LIVE
                  </span>

                </div>

                <div className="disaster-status-box">

                  <div className="status-warning">
                    <FaExclamationTriangle />
                  </div>

                  <div>

                    <strong>
                      Emergency Response Active
                    </strong>

                    <p>
                      Relief operations are currently
                      active in affected areas.
                    </p>

                  </div>

                </div>

                <div className="disaster-details">

                  <div>

                    <span>
                      Relief Camps
                    </span>

                    <strong>
                      {dashboardLoading
                        ? "..."
                        : dashboardStats.reliefCamps}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Volunteers
                    </span>

                    <strong>
                      {dashboardLoading
                        ? "..."
                        : dashboardStats.volunteers}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Active Requests
                    </span>

                    <strong>
                      {dashboardLoading
                        ? "..."
                        : dashboardStats.activeRequests}
                    </strong>

                  </div>

                </div>

              </div>

            </section>

          </>
        ) : (
          renderSection()
        )}

      </main>

    </div>
  );
}

export default Citizen;