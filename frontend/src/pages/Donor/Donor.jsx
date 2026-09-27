import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaBars,
  FaCheckCircle,
  FaChevronRight,
  FaClipboardList,
  FaCoins,
  FaEnvelope,
  FaHistory,
  FaLock,
  FaMoneyBillWave,
  FaPen,
  FaPhone,
  FaSignOutAlt,
  FaTimes,
  FaUser,
  FaUserCircle,
  FaUtensils,
  FaTint,
  FaHeartbeat,
  FaHome,
  FaBoxOpen,
  FaHandsHelping,
  FaArrowLeft,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";

import "./Donor.css";

function Donor() {
  const navigate = useNavigate();

  const {
    user,
    loading: authLoading,
    updateProfile,
    logout,
  } = useAuth();

  const [activeSection, setActiveSection] =
    useState("dashboard");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  // Controls what is shown inside My Profile
  // view = normal profile
  // edit = edit profile form
  // password = change password form
  const [profileMode, setProfileMode] =
    useState("view");

  const [stats, setStats] = useState({
    totalDonated: 0,
    totalDonations: 0,
    recordedDonations: 0,
    verifiedDonations: 0,
    usedDonations: 0,
  });

  const [donations, setDonations] = useState([]);

  const [pageLoading, setPageLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const [donationForm, setDonationForm] =
    useState({
      amount: "",
      donationType: "General Relief",
      message: "",
    });

  const [profileForm, setProfileForm] =
    useState({
      fullName: "",
      phone: "",
      address: "",
    });

  const [passwordForm, setPasswordForm] =
    useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

  // =========================================================
  // Load Donor Data
  // =========================================================

  const loadDonorData = async () => {
    try {
      setPageLoading(true);

      const [statsResponse, donationsResponse] =
        await Promise.all([
          API.get("/donations/stats"),
          API.get("/donations/my-donations"),
        ]);

      setStats(
        statsResponse.data.stats || {
          totalDonated: 0,
          totalDonations: 0,
          recordedDonations: 0,
          verifiedDonations: 0,
          usedDonations: 0,
        }
      );

      setDonations(
        donationsResponse.data.donations || []
      );
    } catch (error) {
      console.error(
        "Failed to load donor data:",
        error
      );

      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Failed to load donor information.",
      });
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      setProfileForm({
        fullName: user.fullName || "",
        phone: user.phone || "",
        address: user.address || "",
      });

      loadDonorData();
    }
  }, [authLoading, user]);

  // =========================================================
  // Helpers
  // =========================================================

  const showMessage = (type, text) => {
    setMessage({
      type,
      text,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    setTimeout(() => {
      setMessage({
        type: "",
        text: "",
      });
    }, 4000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getDonationIcon = (type) => {
    switch (type) {
      case "Food":
        return <FaUtensils />;

      case "Water":
        return <FaTint />;

      case "Medical Supplies":
        return <FaHeartbeat />;

      case "Shelter":
        return <FaHome />;

      case "Essential Supplies":
        return <FaBoxOpen />;

      default:
        return <FaHandsHelping />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Verified":
        return "status-verified";

      case "Used":
        return "status-used";

      default:
        return "status-recorded";
    }
  };

  const recentDonations = useMemo(() => {
    return donations.slice(0, 5);
  }, [donations]);

  // =========================================================
  // Navigation
  // =========================================================

  const changeSection = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);

    // Whenever profile is opened normally,
    // show the profile view instead of an edit form.
    if (section === "profile") {
      setProfileMode("view");
    }

    setMessage({
      type: "",
      text: "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // Profile Navigation
  // =========================================================

  const openProfileView = () => {
    setProfileMode("view");

    setMessage({
      type: "",
      text: "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const openEditProfile = () => {
    setProfileForm({
      fullName: user?.fullName || "",
      phone: user?.phone || "",
      address: user?.address || "",
    });

    setProfileMode("edit");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const openChangePassword = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setProfileMode("password");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // Donation Form
  // =========================================================

  const handleDonationChange = (e) => {
    const { name, value } = e.target;

    setDonationForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleDonationSubmit = async (e) => {
    e.preventDefault();

    setMessage({
      type: "",
      text: "",
    });

    const amount = Number(
      donationForm.amount
    );

    if (!donationForm.amount) {
      showMessage(
        "error",
        "Please enter a donation amount."
      );
      return;
    }

    if (Number.isNaN(amount) || amount < 1) {
      showMessage(
        "error",
        "Donation amount must be at least ₹1."
      );
      return;
    }

    try {
      setActionLoading(true);

      const response = await API.post(
        "/donations",
        {
          amount,
          donationType:
            donationForm.donationType,
          message: donationForm.message,
        }
      );

      const newDonation =
        response.data.donation;

      setDonationForm({
        amount: "",
        donationType: "General Relief",
        message: "",
      });

      await loadDonorData();

      showMessage(
        "success",
        `Donation recorded successfully. Reference ID: ${newDonation.referenceId}`
      );

      setActiveSection("dashboard");
    } catch (error) {
      console.error(
        "Donation error:",
        error
      );

      showMessage(
        "error",
        error.response?.data?.message ||
          "Failed to record donation."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================================================
  // Profile
  // =========================================================

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setProfileForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    try {
      setActionLoading(true);

      await updateProfile(profileForm);

      setProfileMode("view");

      showMessage(
        "success",
        "Profile updated successfully."
      );
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      showMessage(
        "error",
        error.response?.data?.message ||
          "Failed to update profile."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================================================
  // Password
  // =========================================================

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      showMessage(
        "error",
        "Please fill in all password fields."
      );
      return;
    }

    if (
      passwordForm.newPassword.length < 6
    ) {
      showMessage(
        "error",
        "New password must contain at least 6 characters."
      );
      return;
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      showMessage(
        "error",
        "New password and confirmation password do not match."
      );
      return;
    }

    try {
      setActionLoading(true);

      await API.put(
        "/auth/change-password",
        {
          currentPassword:
            passwordForm.currentPassword,
          newPassword:
            passwordForm.newPassword,
        }
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setProfileMode("view");

      showMessage(
        "success",
        "Password changed successfully."
      );
    } catch (error) {
      console.error(
        "Password change error:",
        error
      );

      showMessage(
        "error",
        error.response?.data?.message ||
          "Failed to change password."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================================================
  // Logout
  // =========================================================

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // =========================================================
  // Loading
  // =========================================================

  if (authLoading || pageLoading) {
    return (
      <div className="donor-loading-page">
        <div className="donor-loader"></div>
        <p>Loading Donor Dashboard...</p>
      </div>
    );
  }

  // =========================================================
  // Dashboard
  // =========================================================

  const renderDashboard = () => {
    return (
      <>
        <div className="donor-welcome-card">
          <div>
            <span className="donor-welcome-label">
              DONOR PORTAL
            </span>

            <h1>
              Welcome back,{" "}
              {user?.fullName?.split(" ")[0] ||
                "Donor"}
              !
            </h1>

            <p>
              Your contribution helps communities
              recover faster during emergencies.
            </p>
          </div>

          <div className="donor-welcome-icon">
            <FaHandsHelping />
          </div>
        </div>

        <section className="donor-stats-grid">
          <div className="donor-stat-card">
            <div className="donor-stat-icon orange">
              <FaMoneyBillWave />
            </div>

            <div>
              <span>Total Donated</span>

              <strong>
                {formatCurrency(
                  stats.totalDonated
                )}
              </strong>
            </div>
          </div>

          <div className="donor-stat-card">
            <div className="donor-stat-icon blue">
              <FaCoins />
            </div>

            <div>
              <span>Total Donations</span>

              <strong>
                {stats.totalDonations}
              </strong>
            </div>
          </div>

          <div className="donor-stat-card">
            <div className="donor-stat-icon green">
              <FaClipboardList />
            </div>

            <div>
              <span>Recorded</span>

              <strong>
                {stats.recordedDonations}
              </strong>
            </div>
          </div>

          <div className="donor-stat-card">
            <div className="donor-stat-icon purple">
              <FaCheckCircle />
            </div>

            <div>
              <span>Verified / Used</span>

              <strong>
                {stats.verifiedDonations +
                  stats.usedDonations}
              </strong>
            </div>
          </div>
        </section>

        <section className="donor-section">
          <div className="donor-section-header">
            <div>
              <h2>Quick Actions</h2>

              <p>
                Choose what you would like to do.
              </p>
            </div>
          </div>

          <div className="donor-actions-grid">
            <button
              className="donor-action-card primary"
              onClick={() =>
                changeSection("donate")
              }
            >
              <div className="donor-action-icon">
                <FaMoneyBillWave />
              </div>

              <div>
                <h3>Make a Donation</h3>

                <p>
                  Contribute resources to disaster
                  relief efforts.
                </p>
              </div>

              <FaChevronRight className="action-arrow" />
            </button>

            <button
              className="donor-action-card"
              onClick={() =>
                changeSection("history")
              }
            >
              <div className="donor-action-icon blue">
                <FaHistory />
              </div>

              <div>
                <h3>My Donations</h3>

                <p>
                  View your complete donation history.
                </p>
              </div>

              <FaChevronRight className="action-arrow" />
            </button>

            <button
              className="donor-action-card"
              onClick={() =>
                changeSection("profile")
              }
            >
              <div className="donor-action-icon green">
                <FaUser />
              </div>

              <div>
                <h3>My Profile</h3>

                <p>
                  Manage your account information.
                </p>
              </div>

              <FaChevronRight className="action-arrow" />
            </button>
          </div>
        </section>

        <section className="donor-section">
          <div className="donor-section-header">
            <div>
              <h2>Recent Donations</h2>

              <p>
                Your latest contributions.
              </p>
            </div>

            {donations.length > 0 && (
              <button
                className="donor-text-button"
                onClick={() =>
                  changeSection("history")
                }
              >
                View All
                <FaChevronRight />
              </button>
            )}
          </div>

          {recentDonations.length === 0 ? (
            <div className="donor-empty-state">
              <div className="empty-icon">
                <FaHandsHelping />
              </div>

              <h3>No donations yet</h3>

              <p>
                Your first contribution can make a
                meaningful difference.
              </p>

              <button
                className="donor-primary-button"
                onClick={() =>
                  changeSection("donate")
                }
              >
                Make Your First Donation
              </button>
            </div>
          ) : (
            <div className="donor-recent-list">
              {recentDonations.map(
                (donation) => (
                  <div
                    className="donor-recent-item"
                    key={donation._id}
                  >
                    <div className="donor-recent-left">
                      <div className="donation-type-icon">
                        {getDonationIcon(
                          donation.donationType
                        )}
                      </div>

                      <div>
                        <h3>
                          {donation.donationType}
                        </h3>

                        <p>
                          {donation.referenceId}
                        </p>
                      </div>
                    </div>

                    <div className="donor-recent-middle">
                      <span>
                        {formatDate(
                          donation.createdAt
                        )}
                      </span>
                    </div>

                    <div className="donor-recent-right">
                      <strong>
                        {formatCurrency(
                          donation.amount
                        )}
                      </strong>

                      <span
                        className={`donor-status ${getStatusClass(
                          donation.status
                        )}`}
                      >
                        {donation.status}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </>
    );
  };

  // =========================================================
  // Donation Form
  // =========================================================

  const renderDonationForm = () => {
    return (
      <section className="donor-section donor-form-section">
        <div className="donor-section-header">
          <div>
            <span className="donor-page-label">
              CONTRIBUTION
            </span>

            <h2>Make a Donation</h2>

            <p>
              Every contribution can help provide
              essential disaster relief support.
            </p>
          </div>
        </div>

        <form
          className="donor-form"
          onSubmit={handleDonationSubmit}
        >
          <div className="donor-form-grid">
            <div className="donor-form-group">
              <label>
                Donation Amount <span>*</span>
              </label>

              <div className="donor-input-with-prefix">
                <span>₹</span>

                <input
                  type="number"
                  name="amount"
                  min="1"
                  step="1"
                  placeholder="Enter amount"
                  value={donationForm.amount}
                  onChange={
                    handleDonationChange
                  }
                />
              </div>
            </div>

            <div className="donor-form-group">
              <label>
                Donation Category{" "}
                <span>*</span>
              </label>

              <select
                name="donationType"
                value={
                  donationForm.donationType
                }
                onChange={
                  handleDonationChange
                }
              >
                <option value="Food">
                  Food
                </option>

                <option value="Water">
                  Water
                </option>

                <option value="Medical Supplies">
                  Medical Supplies
                </option>

                <option value="Shelter">
                  Shelter
                </option>

                <option value="Essential Supplies">
                  Essential Supplies
                </option>

                <option value="General Relief">
                  General Relief
                </option>
              </select>
            </div>
          </div>

          <div className="donor-form-group">
            <label>
              Message{" "}
              <span className="optional">
                (Optional)
              </span>
            </label>

            <textarea
              name="message"
              rows="5"
              maxLength="500"
              placeholder="Add a short message about your contribution..."
              value={donationForm.message}
              onChange={handleDonationChange}
            />
          </div>

          <div className="donor-form-note">
            <FaCheckCircle />

            <p>
              Your donation will be securely recorded
              in the ReliefConnect system. A unique
              reference ID will be generated for your
              contribution.
            </p>
          </div>

          <div className="donor-form-actions">
            <button
              type="button"
              className="donor-secondary-button"
              onClick={() =>
                changeSection("dashboard")
              }
              disabled={actionLoading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="donor-primary-button"
              disabled={actionLoading}
            >
              {actionLoading ? (
                "Recording Donation..."
              ) : (
                <>
                  <FaMoneyBillWave />
                  Record Donation
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    );
  };

  // =========================================================
  // Donation History
  // =========================================================

  const renderDonationHistory = () => {
    return (
      <section className="donor-section">
        <div className="donor-section-header">
          <div>
            <span className="donor-page-label">
              HISTORY
            </span>

            <h2>My Donations</h2>

            <p>
              View and track all your contributions.
            </p>
          </div>

          <button
            className="donor-primary-button compact"
            onClick={() =>
              changeSection("donate")
            }
          >
            <FaMoneyBillWave />
            Make Donation
          </button>
        </div>

        {donations.length === 0 ? (
          <div className="donor-empty-state">
            <div className="empty-icon">
              <FaHistory />
            </div>

            <h3>No donation history</h3>

            <p>
              Your completed donations will appear
              here.
            </p>
          </div>
        ) : (
          <div className="donation-table-wrapper">
            <table className="donation-table">
              <thead>
                <tr>
                  <th>Donation</th>
                  <th>Reference ID</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {donations.map((donation) => (
                  <tr key={donation._id}>
                    <td>
                      <div className="table-donation">
                        <div className="table-donation-icon">
                          {getDonationIcon(
                            donation.donationType
                          )}
                        </div>

                        <span>
                          {
                            donation.donationType
                          }
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className="reference-id">
                        {donation.referenceId}
                      </span>
                    </td>

                    <td>
                      <strong>
                        {formatCurrency(
                          donation.amount
                        )}
                      </strong>
                    </td>

                    <td>
                      {formatDate(
                        donation.createdAt
                      )}
                    </td>

                    <td>
                      <span
                        className={`donor-status ${getStatusClass(
                          donation.status
                        )}`}
                      >
                        {donation.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    );
  };

  // =========================================================
  // Profile View
  // =========================================================

  const renderProfileView = () => {
    return (
      <section className="donor-section">
        <div className="donor-section-header">
          <div>
            <span className="donor-page-label">
              ACCOUNT
            </span>

            <h2>My Profile</h2>

            <p>
              View your ReliefConnect account
              information.
            </p>
          </div>
        </div>

        <div className="donor-profile-summary">
          <div className="donor-profile-avatar">
            <FaUser />
          </div>

          <div>
            <h3>
              {user?.fullName || "Donor"}
            </h3>

            <p>{user?.email || "—"}</p>

            <span className="donor-role-badge">
              Donor
            </span>
          </div>
        </div>

        <div className="donor-profile-details">
          <div className="donor-profile-detail">
            <div className="donor-profile-detail-icon">
              <FaUser />
            </div>

            <div>
              <span>Full Name</span>
              <strong>
                {user?.fullName || "—"}
              </strong>
            </div>
          </div>

          <div className="donor-profile-detail">
            <div className="donor-profile-detail-icon">
              <FaEnvelope />
            </div>

            <div>
              <span>Email Address</span>
              <strong>
                {user?.email || "—"}
              </strong>
            </div>
          </div>

          <div className="donor-profile-detail">
            <div className="donor-profile-detail-icon">
              <FaPhone />
            </div>

            <div>
              <span>Phone Number</span>
              <strong>
                {user?.phone || "—"}
              </strong>
            </div>
          </div>

          <div className="donor-profile-detail">
            <div className="donor-profile-detail-icon">
              <FaHome />
            </div>

            <div>
              <span>Address</span>
              <strong>
                {user?.address || "—"}
              </strong>
            </div>
          </div>

          <div className="donor-profile-detail">
            <div className="donor-profile-detail-icon">
              <FaUserCircle />
            </div>

            <div>
              <span>Account Role</span>
              <strong>Donor</strong>
            </div>
          </div>
        </div>

        <div className="donor-profile-actions">
          <button
            className="donor-primary-button"
            onClick={openEditProfile}
          >
            <FaPen />
            Edit Profile
          </button>

          <button
            className="donor-secondary-button"
            onClick={openChangePassword}
          >
            <FaLock />
            Change Password
          </button>
        </div>
      </section>
    );
  };

  // =========================================================
  // Edit Profile
  // =========================================================

  const renderEditProfile = () => {
    return (
      <section className="donor-section">
        <div className="donor-section-header">
          <div>
            <button
              type="button"
              className="donor-back-button"
              onClick={openProfileView}
            >
              <FaArrowLeft />
              Back to Profile
            </button>

            <span className="donor-page-label">
              ACCOUNT
            </span>

            <h2>Edit Profile</h2>

            <p>
              Update your personal account
              information.
            </p>
          </div>
        </div>

        <form
          className="donor-form"
          onSubmit={handleProfileSubmit}
        >
          <div className="donor-form-grid">
            <div className="donor-form-group">
              <label>Full Name</label>

              <div className="donor-input-icon">
                <FaUser />

                <input
                  type="text"
                  name="fullName"
                  value={
                    profileForm.fullName
                  }
                  onChange={
                    handleProfileChange
                  }
                />
              </div>
            </div>

            <div className="donor-form-group">
              <label>Email Address</label>

              <div className="donor-input-icon disabled">
                <FaEnvelope />

                <input
                  type="email"
                  value={
                    user?.email || ""
                  }
                  disabled
                />
              </div>

              <small>
                Email address cannot be changed
                here.
              </small>
            </div>

            <div className="donor-form-group">
              <label>Phone Number</label>

              <div className="donor-input-icon">
                <FaPhone />

                <input
                  type="tel"
                  name="phone"
                  value={
                    profileForm.phone
                  }
                  onChange={
                    handleProfileChange
                  }
                />
              </div>
            </div>

            <div className="donor-form-group">
              <label>Address</label>

              <div className="donor-input-icon">
                <FaHome />

                <input
                  type="text"
                  name="address"
                  value={
                    profileForm.address
                  }
                  onChange={
                    handleProfileChange
                  }
                />
              </div>
            </div>
          </div>

          <div className="donor-form-actions">
            <button
              type="button"
              className="donor-secondary-button"
              onClick={openProfileView}
              disabled={actionLoading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="donor-primary-button"
              disabled={actionLoading}
            >
              <FaPen />

              {actionLoading
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </section>
    );
  };

  // =========================================================
  // Change Password
  // =========================================================

  const renderChangePassword = () => {
    return (
      <section className="donor-section">
        <div className="donor-section-header">
          <div>
            <button
              type="button"
              className="donor-back-button"
              onClick={openProfileView}
            >
              <FaArrowLeft />
              Back to Profile
            </button>

            <span className="donor-page-label">
              SECURITY
            </span>

            <h2>Change Password</h2>

            <p>
              Update your ReliefConnect account
              password.
            </p>
          </div>
        </div>

        <form
          className="donor-form"
          onSubmit={handlePasswordSubmit}
        >
          <div className="donor-form-group">
            <label>
              Current Password
            </label>

            <div className="donor-input-icon">
              <FaLock />

              <input
                type="password"
                name="currentPassword"
                placeholder="Enter current password"
                value={
                  passwordForm.currentPassword
                }
                onChange={
                  handlePasswordChange
                }
              />
            </div>
          </div>

          <div className="donor-form-grid">
            <div className="donor-form-group">
              <label>New Password</label>

              <div className="donor-input-icon">
                <FaLock />

                <input
                  type="password"
                  name="newPassword"
                  placeholder="Enter new password"
                  value={
                    passwordForm.newPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                />
              </div>
            </div>

            <div className="donor-form-group">
              <label>
                Confirm New Password
              </label>

              <div className="donor-input-icon">
                <FaLock />

                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={
                    passwordForm.confirmPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                />
              </div>
            </div>
          </div>

          <div className="donor-form-note">
            <FaLock />

            <p>
              Use a password with at least 6
              characters. Your current password is
              required to confirm this change.
            </p>
          </div>

          <div className="donor-form-actions">
            <button
              type="button"
              className="donor-secondary-button"
              onClick={openProfileView}
              disabled={actionLoading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="donor-primary-button"
              disabled={actionLoading}
            >
              <FaLock />

              {actionLoading
                ? "Updating..."
                : "Change Password"}
            </button>
          </div>
        </form>
      </section>
    );
  };

  // =========================================================
  // Profile Router
  // =========================================================

  const renderProfile = () => {
    if (profileMode === "edit") {
      return renderEditProfile();
    }

    if (profileMode === "password") {
      return renderChangePassword();
    }

    return renderProfileView();
  };

  // =========================================================
  // Main Render
  // =========================================================

  return (
    <div className="donor-page">

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="donor-sidebar-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* Sidebar */}
      <aside
        className={`donor-sidebar ${
          sidebarOpen
            ? "donor-sidebar-open"
            : ""
        }`}
      >
        <div className="donor-sidebar-brand">
          <div className="donor-brand-icon">
            <FaHandsHelping />
          </div>

          <div>
            <h2>ReliefConnect</h2>
            <span>Donor Portal</span>
          </div>

          <button
            className="donor-mobile-close"
            onClick={() =>
              setSidebarOpen(false)
            }
          >
            <FaTimes />
          </button>
        </div>

        <div className="donor-user-mini">
          <div className="donor-mini-avatar">
            <FaUser />
          </div>

          <div>
            <strong>
              {user?.fullName || "Donor"}
            </strong>

            <span>Donor</span>
          </div>
        </div>

        <nav className="donor-sidebar-nav">
          <button
            className={
              activeSection === "dashboard"
                ? "active"
                : ""
            }
            onClick={() =>
              changeSection("dashboard")
            }
          >
            <FaHome />
            <span>Dashboard</span>
          </button>

          <button
            className={
              activeSection === "donate"
                ? "active"
                : ""
            }
            onClick={() =>
              changeSection("donate")
            }
          >
            <FaMoneyBillWave />
            <span>Make Donation</span>
          </button>

          <button
            className={
              activeSection === "history"
                ? "active"
                : ""
            }
            onClick={() =>
              changeSection("history")
            }
          >
            <FaHistory />
            <span>My Donations</span>
          </button>

          <button
            className={
              activeSection === "profile"
                ? "active"
                : ""
            }
            onClick={() =>
              changeSection("profile")
            }
          >
            <FaUserCircle />
            <span>My Profile</span>
          </button>
        </nav>

        <div className="donor-sidebar-bottom">
          <button
            className="donor-logout-button"
            onClick={handleLogout}
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="donor-main">

        {/* Top Header */}
        <header className="donor-topbar">
          <button
            className="donor-mobile-menu"
            onClick={() =>
              setSidebarOpen(true)
            }
          >
            <FaBars />
          </button>

          <div className="donor-topbar-title">
            <span>ReliefConnect</span>

            <strong>
              {activeSection ===
                "dashboard" &&
                "Dashboard"}

              {activeSection === "donate" &&
                "Make Donation"}

              {activeSection === "history" &&
                "My Donations"}

              {activeSection === "profile" &&
                "My Profile"}
            </strong>
          </div>

          <button
            className="donor-top-profile"
            onClick={() =>
              changeSection("profile")
            }
          >
            <FaUserCircle />

            <span>
              {user?.fullName || "Donor"}
            </span>
          </button>
        </header>

        <div className="donor-content">

          {message.text && (
            <div
              className={`donor-alert ${
                message.type === "success"
                  ? "success"
                  : "error"
              }`}
            >
              {message.type ===
              "success" ? (
                <FaCheckCircle />
              ) : (
                <FaTimes />
              )}

              <span>{message.text}</span>
            </div>
          )}

          {activeSection ===
            "dashboard" &&
            renderDashboard()}

          {activeSection === "donate" &&
            renderDonationForm()}

          {activeSection === "history" &&
            renderDonationHistory()}

          {activeSection === "profile" &&
            renderProfile()}
        </div>
      </main>
    </div>
  );
}

export default Donor;