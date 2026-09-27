import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./VolunteerDashboard.css";

import {
  FaBell,
  FaChartPie,
  FaExclamationTriangle,
  FaHandsHelping,
  FaClipboardList,
  FaUser,
  FaSignOutAlt,
  FaMapMarkerAlt,
  FaPhone,
  FaFileAlt,
  FaCheckCircle,
  FaClock,
  FaArrowRight,
  FaSyncAlt,
  FaHeart,
  FaShieldAlt,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaKey,
  FaMapMarkedAlt,
} from "react-icons/fa";

import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const CHENNAI_CENTER = [13.0827, 80.2707];

function createMarkerIcon(type) {
  const colors = {
    emergency: "#dc2626",
    assistance: "#ff7100",
    camp: "#1565c0",
  };

  const color = colors[type] || colors.emergency;

  return L.divIcon({
    className: "volunteer-map-marker-wrapper",
    html: `<div class="volunteer-map-marker" style="background:${color}"><span></span></div>`,
    iconSize: [34, 42],
    iconAnchor: [17, 42],
    popupAnchor: [0, -40],
  });
}

function MapFocus({ item }) {
  const map = useMap();

  useEffect(() => {
    if (!item?.latitude || !item?.longitude) return;

    map.flyTo([item.latitude, item.longitude], 15, {
      duration: 0.8,
    });
  }, [item, map]);

  return null;
}

function VolunteerRequestMap({ requests, camps, compact = false }) {
  const [focusedItem, setFocusedItem] = useState(null);

  const mappableRequests = requests.filter(
    (request) =>
      typeof request.latitude === "number" &&
      typeof request.longitude === "number"
  );

  const mappableCamps = camps.filter(
    (camp) =>
      typeof camp.latitude === "number" &&
      typeof camp.longitude === "number"
  );

  const openDirections = (item) => {
    if (typeof item.latitude === "number" && typeof item.longitude === "number") {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`,
        "_blank",
        "noopener,noreferrer"
      );
      return;
    }

    if (item.location) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  return (
    <div className={`volunteer-map-shell ${compact ? "compact" : ""}`}>
      <div className="volunteer-map-container">
        <MapContainer
          center={CHENNAI_CENTER}
          zoom={11}
          scrollWheelZoom
          className="volunteer-leaflet-map"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapFocus item={focusedItem} />

          {mappableRequests.map((request) => {
            const isEmergency = request.requestCategory === "Emergency";
            const title = isEmergency
              ? request.emergencyType
              : request.assistanceType;

            return (
              <Marker
                key={`${request.requestCategory}-${request._id}`}
                position={[request.latitude, request.longitude]}
                icon={createMarkerIcon(isEmergency ? "emergency" : "assistance")}
              >
                <Popup>
                  <div className="volunteer-map-popup">
                    <span className={`map-popup-label ${isEmergency ? "emergency" : "assistance"}`}>
                      {isEmergency ? "EMERGENCY" : "ASSISTANCE"}
                    </span>
                    <h4>{title}</h4>
                    <p><strong>Location:</strong> {request.location || "Location provided"}</p>
                    <p><strong>Status:</strong> {request.status || "Pending"}</p>
                    <p><strong>Priority:</strong> {isEmergency ? request.severity : request.priority}</p>
                    {request.user?.fullName && (
                      <p><strong>Person:</strong> {request.user.fullName}</p>
                    )}
                    {request.contactNumber && (
                      <p><strong>Contact:</strong> {request.contactNumber}</p>
                    )}
                    <button type="button" onClick={() => openDirections(request)}>
                      <FaMapMarkerAlt /> Get Directions
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {mappableCamps.map((camp) => (
            <Marker
              key={`camp-${camp._id}`}
              position={[camp.latitude, camp.longitude]}
              icon={createMarkerIcon("camp")}
            >
              <Popup>
                <div className="volunteer-map-popup">
                  <span className="map-popup-label camp">RELIEF CAMP</span>
                  <h4>{camp.name}</h4>
                  <p><strong>Location:</strong> {camp.location}</p>
                  <p><strong>Status:</strong> {camp.status}</p>
                  <p><strong>Available:</strong> {Math.max((camp.capacity || 0) - (camp.occupied || 0), 0)}</p>
                  <button type="button" onClick={() => openDirections(camp)}>
                    <FaMapMarkerAlt /> Get Directions
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="volunteer-map-list">
        <div className="volunteer-map-list-header">
          <div>
            <span>ACTIVE LOCATIONS</span>
            <strong>{mappableRequests.length} request{mappableRequests.length === 1 ? "" : "s"} on map</strong>
          </div>
          <FaMapMarkedAlt />
        </div>

        {mappableRequests.length === 0 ? (
          <div className="volunteer-map-empty">
            <FaMapMarkerAlt />
            <strong>No request coordinates yet</strong>
            <p>Requests will appear here when their location coordinates are available.</p>
          </div>
        ) : (
          <div className="volunteer-map-request-list">
            {mappableRequests.slice(0, compact ? 4 : 12).map((request) => {
              const isEmergency = request.requestCategory === "Emergency";
              return (
                <button
                  type="button"
                  className="volunteer-map-request-item"
                  key={`${request.requestCategory}-${request._id}`}
                  onClick={() => setFocusedItem(request)}
                >
                  <span className={`map-request-dot ${isEmergency ? "emergency" : "assistance"}`} />
                  <span>
                    <strong>{isEmergency ? request.emergencyType : request.assistanceType}</strong>
                    <small>{request.location}</small>
                  </span>
                  <FaArrowRight />
                </button>
              );
            })}
          </div>
        )}

        {requests.some((request) => typeof request.latitude !== "number" || typeof request.longitude !== "number") && (
          <p className="volunteer-map-note">
            Some requests have only a text location and cannot be placed precisely on the map yet.
          </p>
        )}
      </div>
    </div>
  );
}

function VolunteerDashboard() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("dashboard");
  const [emergencies, setEmergencies] = useState([]);
  const [assistances, setAssistances] = useState([]);
  const [myEmergencies, setMyEmergencies] = useState([]);
  const [myAssistances, setMyAssistances] = useState([]);
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  const [profileEditing, setProfileEditing] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    role: "",
  });

  const [passwordEditing, setPasswordEditing] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [availableResponse, myResponse, campResponse] = await Promise.all([
        API.get("/volunteers/requests"),
        API.get("/volunteers/my-requests"),
        API.get("/relief-camps"),
      ]);

      setEmergencies(availableResponse.data.emergencies || []);
      setAssistances(availableResponse.data.assistances || []);
      setMyEmergencies(myResponse.data.emergencies || []);
      setMyAssistances(myResponse.data.assistances || []);
      setCamps(campResponse.data.camps || []);
    } catch (err) {
      console.error("Volunteer dashboard error:", err);
      setError(err.response?.data?.message || "Failed to load volunteer dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (!user) return;
    setProfileData({
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      role: user.role || "Volunteer",
    });
  }, [user]);

  const acceptRequest = async (type, id) => {
    try {
      setActionLoading(`${type}-${id}`);
      await API.put(`/volunteers/${type}/${id}/accept`);
      await loadDashboard();
      setActiveSection("assigned");
    } catch (err) {
      alert(err.response?.data?.message || `Failed to accept ${type} request.`);
    } finally {
      setActionLoading(null);
    }
  };

  const updateRequestStatus = async (type, id, status) => {
    try {
      setActionLoading(`${type}-status-${id}`);
      await API.put(`/volunteers/${type}/${id}/status`, { status });
      await loadDashboard();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update request status.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData((current) => ({ ...current, [e.target.name]: e.target.value }));
    setProfileMessage("");
    setProfileError("");
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      setProfileLoading(true);
      setProfileMessage("");
      setProfileError("");
      await updateProfile({
        fullName: profileData.fullName,
        phone: profileData.phone,
        address: profileData.address,
      });
      setProfileMessage("Profile updated successfully.");
      setProfileEditing(false);
    } catch (err) {
      setProfileError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  const openProfile = () => {
    setActiveSection("profile");
    setProfileEditing(false);
    setPasswordEditing(false);
    setProfileMessage("");
    setProfileError("");
    setPasswordMessage("");
    setPasswordError("");
  };

  const openProfileEditor = () => {
    setProfileEditing(true);
    setPasswordEditing(false);
    setProfileMessage("");
    setProfileError("");
  };

  const cancelProfileEdit = () => {
    if (user) {
      setProfileData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        role: user.role || "Volunteer",
      });
    }
    setProfileEditing(false);
    setProfileMessage("");
    setProfileError("");
  };

  const openPasswordEditor = () => {
    setProfileEditing(false);
    setPasswordEditing(true);
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordMessage("");
    setPasswordError("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    setPasswordMessage("");
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must contain at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation password do not match.");
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from your current password.");
      return;
    }

    try {
      setPasswordLoading(true);
      const response = await API.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      setPasswordMessage(response.data?.message || "Password changed successfully.");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const cancelPasswordEdit = () => {
    setPasswordEditing(false);
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordMessage("");
    setPasswordError("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const allAssignedRequests = useMemo(() => [
    ...myEmergencies.map((item) => ({ ...item, requestCategory: "Emergency" })),
    ...myAssistances.map((item) => ({ ...item, requestCategory: "Assistance" })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [myEmergencies, myAssistances]);

  const completedRequests = allAssignedRequests.filter(
    (request) => request.status === "Resolved" || request.status === "Fulfilled"
  );

  const inProgressRequests = allAssignedRequests.filter(
    (request) => request.status === "In Progress"
  );

  const mapRequests = useMemo(() => {
    const available = [
      ...emergencies.map((item) => ({ ...item, requestCategory: "Emergency" })),
      ...assistances.map((item) => ({ ...item, requestCategory: "Assistance" })),
    ];

    const assigned = allAssignedRequests.filter(
      (item) => item.status !== "Resolved" && item.status !== "Fulfilled"
    );

    const unique = new Map();
    [...available, ...assigned].forEach((item) => {
      unique.set(`${item.requestCategory}-${item._id}`, item);
    });
    return [...unique.values()];
  }, [emergencies, assistances, allAssignedRequests]);

  const RequestCard = ({ request, category, available = false }) => {
    const isEmergency = category === "Emergency";
    const completed = request.status === "Resolved" || request.status === "Fulfilled";
    const type = isEmergency ? "emergency" : "assistance";
    const actionKey = `${type}-${request._id}`;
    const title = isEmergency ? request.emergencyType : request.assistanceType;
    const priority = isEmergency ? request.severity : request.priority;

    return (
      <div className="volunteer-request-card">
        <div className="volunteer-request-top">
          <div>
            <span className={`volunteer-request-label ${isEmergency ? "emergency" : "assistance"}`}>
              {isEmergency ? "EMERGENCY" : "ASSISTANCE"}
            </span>
            <h3>{title}</h3>
          </div>
          {available ? (
            <span className={`volunteer-priority ${String(priority || "").toLowerCase()}`}>{priority}</span>
          ) : (
            <span className="volunteer-status">{request.status}</span>
          )}
        </div>

        <div className="volunteer-request-details">
          <p><FaMapMarkerAlt /><strong>Location:</strong>{request.location}</p>
          {request.contactNumber && <p><FaPhone /><strong>Contact:</strong>{request.contactNumber}</p>}
          {request.description && <p><FaFileAlt /><strong>Description:</strong>{request.description}</p>}
          {request.user?.fullName && <p><FaUser /><strong>{isEmergency ? "Reported by:" : "Requested by:"}</strong>{request.user.fullName}</p>}
        </div>

        {available && (
          <button
            type="button"
            className="volunteer-accept-btn"
            onClick={() => acceptRequest(type, request._id)}
            disabled={actionLoading === actionKey}
          >
            {actionLoading === actionKey ? "Accepting..." : "Accept Request"}
            <FaArrowRight />
          </button>
        )}

        {!available && !completed && (
          <div className="volunteer-status-actions">
            {request.status !== "In Progress" && (
              <button
                type="button"
                className="volunteer-progress-btn"
                disabled={actionLoading !== null}
                onClick={() => updateRequestStatus(type, request._id, "In Progress")}
              >
                <FaClock /> Start Progress
              </button>
            )}
            <button
              type="button"
              className="volunteer-complete-btn"
              disabled={actionLoading !== null}
              onClick={() => updateRequestStatus(type, request._id, isEmergency ? "Resolved" : "Fulfilled")}
            >
              <FaCheckCircle /> {isEmergency ? "Mark Resolved" : "Mark Fulfilled"}
            </button>
          </div>
        )}
      </div>
    );
  };

  const SidebarItem = ({ icon, label, section, count }) => (
    <button
      type="button"
      className={`volunteer-sidebar-item ${activeSection === section ? "active" : ""}`}
      onClick={() => (section === "profile" ? openProfile() : setActiveSection(section))}
    >
      <span className="sidebar-item-icon">{icon}</span>
      <span>{label}</span>
      {count !== undefined && count > 0 && <span className="sidebar-count">{count}</span>}
    </button>
  );

  return (
    <div className="volunteer-portal">
      <aside className="volunteer-sidebar">
        <div className="volunteer-brand">
          <div className="volunteer-brand-logo">RC</div>
          <div><h2>Relief<span>Connect</span></h2><p>Volunteer Portal</p></div>
        </div>
        <div className="volunteer-sidebar-divider" />

        <nav className="volunteer-sidebar-nav">
          <SidebarItem icon={<FaChartPie />} label="Dashboard" section="dashboard" />
          <SidebarItem icon={<FaExclamationTriangle />} label="Emergencies" section="emergencies" count={emergencies.length} />
          <SidebarItem icon={<FaHandsHelping />} label="Assistance" section="assistance" count={assistances.length} />
          <SidebarItem icon={<FaClipboardList />} label="Assigned Work" section="assigned" count={allAssignedRequests.length} />
          <SidebarItem icon={<FaMapMarkedAlt />} label="Response Map" section="map" />
          <SidebarItem icon={<FaUser />} label="Profile" section="profile" />
        </nav>

        <div className="volunteer-sidebar-bottom">
          <button type="button" className="volunteer-logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /><span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="volunteer-main">
        <header className="volunteer-topbar">
          <div>
            <p className="volunteer-page-label">
              {activeSection === "dashboard" ? "VOLUNTEER DASHBOARD" :
               activeSection === "emergencies" ? "EMERGENCY REQUESTS" :
               activeSection === "assistance" ? "ASSISTANCE REQUESTS" :
               activeSection === "assigned" ? "ASSIGNED WORK" :
               activeSection === "map" ? "RESPONSE MAP" : "VOLUNTEER PROFILE"}
            </p>
            <h1>Welcome back, {user?.fullName || "Volunteer"} 👋</h1>
            <p className="volunteer-page-subtitle">
              {activeSection === "dashboard" ? "Coordinate emergency response and help people who need assistance." :
               activeSection === "emergencies" ? "Review and respond to emergency requests waiting for support." :
               activeSection === "assistance" ? "Help people with food, water, medical support and essential supplies." :
               activeSection === "assigned" ? "Manage the requests you have accepted and are currently handling." :
               activeSection === "map" ? "Locate active emergency and assistance requests and get directions to people who need help." :
               "View and manage your volunteer account information."}
            </p>
          </div>

          <div className="volunteer-topbar-actions">
            <button type="button" className="volunteer-refresh-icon" onClick={loadDashboard} disabled={loading} title="Refresh dashboard">
              <FaSyncAlt />
            </button>
            <button type="button" className="volunteer-notification-btn" title="Notifications">
              <FaBell />
            </button>
          </div>
        </header>

        {error && <div className="volunteer-dashboard-error">{error}</div>}

        {activeSection === "dashboard" && (
          <>
            <section className="volunteer-stats">
              <div className="volunteer-stat-card stat-blue"><div className="volunteer-stat-icon"><FaExclamationTriangle /></div><div><p>Available Emergencies</p><h2>{emergencies.length}</h2></div></div>
              <div className="volunteer-stat-card stat-orange"><div className="volunteer-stat-icon"><FaHandsHelping /></div><div><p>Assistance Requests</p><h2>{assistances.length}</h2></div></div>
              <div className="volunteer-stat-card stat-green"><div className="volunteer-stat-icon"><FaClipboardList /></div><div><p>Assigned Work</p><h2>{allAssignedRequests.length}</h2></div></div>
              <div className="volunteer-stat-card stat-red"><div className="volunteer-stat-icon"><FaCheckCircle /></div><div><p>Completed Requests</p><h2>{completedRequests.length}</h2></div></div>
            </section>

            <section className="volunteer-content-section">
              <div className="volunteer-section-heading">
                <div><h2>Quick Actions</h2><p>Quickly access requests, assigned work and your account.</p></div>
              </div>
              <div className="volunteer-quick-actions">
                <button type="button" onClick={() => setActiveSection("emergencies")} className="volunteer-quick-card quick-emergency">
                  <div className="quick-icon volunteer-quick-red"><FaExclamationTriangle /></div>
                  <div className="quick-card-content"><h3>View Emergencies</h3><p>Find emergency requests waiting for support.</p><span className="quick-card-link">View requests <FaArrowRight /></span></div>
                  <div className="quick-card-arrow"><FaArrowRight /></div>
                </button>
                <button type="button" onClick={() => setActiveSection("assistance")} className="volunteer-quick-card quick-assistance">
                  <div className="quick-icon volunteer-quick-orange"><FaHandsHelping /></div>
                  <div className="quick-card-content"><h3>Help With Assistance</h3><p>Respond to food, water, medical and supply requests.</p><span className="quick-card-link">View requests <FaArrowRight /></span></div>
                  <div className="quick-card-arrow"><FaArrowRight /></div>
                </button>
                <button type="button" onClick={() => setActiveSection("assigned")} className="volunteer-quick-card quick-assigned">
                  <div className="quick-icon volunteer-quick-blue"><FaClipboardList /></div>
                  <div className="quick-card-content"><h3>Assigned Work</h3><p>Track requests you have accepted and are handling.</p><span className="quick-card-link">Manage work <FaArrowRight /></span></div>
                  <div className="quick-card-arrow"><FaArrowRight /></div>
                </button>
                <button type="button" onClick={openProfile} className="volunteer-quick-card quick-profile">
                  <div className="quick-icon volunteer-quick-green"><FaUser /></div>
                  <div className="quick-card-content"><h3>My Profile</h3><p>View your account and manage your profile settings.</p><span className="quick-card-link">Open profile <FaArrowRight /></span></div>
                  <div className="quick-card-arrow"><FaArrowRight /></div>
                </button>
              </div>
            </section>

            <section className="volunteer-content-section volunteer-map-preview-section">
              <div className="volunteer-section-heading">
                <div><h2>Response Map</h2><p>See request locations and reach people faster.</p></div>
                <button type="button" className="volunteer-view-all" onClick={() => setActiveSection("map")}>Open Full Map</button>
              </div>
              <VolunteerRequestMap requests={mapRequests} camps={camps} compact />
            </section>

            <div className="volunteer-dashboard-grid">
              <section className="volunteer-content-section">
                <div className="volunteer-section-heading">
                  <div><h2>Recent Assigned Requests</h2><p>Your latest volunteer activity.</p></div>
                  <button type="button" className="volunteer-view-all" onClick={() => setActiveSection("assigned")}>View All</button>
                </div>
                {allAssignedRequests.length === 0 ? (
                  <div className="volunteer-empty"><FaClipboardList /><h3>No assigned requests yet</h3><p>Accept a request to start helping people.</p></div>
                ) : (
                  <div className="volunteer-recent-list">
                    {allAssignedRequests.slice(0, 5).map((request) => {
                      const isEmergency = request.requestCategory === "Emergency";
                      return <div className="volunteer-recent-item" key={`${request.requestCategory}-${request._id}`}><div className={`recent-item-icon ${isEmergency ? "emergency" : "assistance"}`}>{isEmergency ? <FaExclamationTriangle /> : <FaHandsHelping />}</div><div className="recent-item-info"><h3>{isEmergency ? request.emergencyType : request.assistanceType}</h3><p>{request.location}</p></div><span className="volunteer-status">{request.status}</span></div>;
                    })}
                  </div>
                )}
              </section>

              <section className="volunteer-content-section">
                <div className="volunteer-section-heading"><div><h2>Volunteer Status</h2><p>Current response activity.</p></div><span className="live-indicator"><span />LIVE</span></div>
                <div className="volunteer-active-box"><div className="active-box-icon"><FaShieldAlt /></div><div><h3>Response Network Active</h3><p>You are available to respond to community requests.</p></div></div>
                <div className="volunteer-mini-stats"><div><span>In Progress</span><strong>{inProgressRequests.length}</strong></div><div><span>Completed</span><strong>{completedRequests.length}</strong></div><div><span>Total Assigned</span><strong>{allAssignedRequests.length}</strong></div></div>
                <div className="volunteer-impact-box"><FaHeart /><div><strong>Every response matters.</strong><p>Your time and effort help communities recover faster.</p></div></div>
              </section>
            </div>
          </>
        )}

        {activeSection === "map" && (
          <section className="volunteer-content-section full-section">
            <div className="volunteer-section-heading">
              <div><h2>Emergency & Assistance Response Map</h2><p>Locate active seekers, inspect their details and open directions.</p></div>
              <span className="volunteer-section-count">{mapRequests.length} Active</span>
            </div>
            <VolunteerRequestMap requests={mapRequests} camps={camps} />
          </section>
        )}

        {activeSection === "emergencies" && (
          <section className="volunteer-content-section full-section">
            <div className="volunteer-section-heading"><div><h2>Available Emergency Requests</h2><p>Emergency requests currently waiting for volunteer support.</p></div><span className="volunteer-section-count">{emergencies.length} {emergencies.length === 1 ? "Request" : "Requests"}</span></div>
            {loading ? <div className="volunteer-loading">Loading emergency requests...</div> : emergencies.length === 0 ? <div className="volunteer-empty"><FaCheckCircle /><h3>No emergency requests available</h3><p>There are currently no unassigned emergencies.</p></div> : <div className="volunteer-request-list">{emergencies.map((request) => <RequestCard key={request._id} request={request} category="Emergency" available />)}</div>}
          </section>
        )}

        {activeSection === "assistance" && (
          <section className="volunteer-content-section full-section">
            <div className="volunteer-section-heading"><div><h2>Available Assistance Requests</h2><p>People requesting food, water, medical help and essential supplies.</p></div><span className="volunteer-section-count">{assistances.length} {assistances.length === 1 ? "Request" : "Requests"}</span></div>
            {loading ? <div className="volunteer-loading">Loading assistance requests...</div> : assistances.length === 0 ? <div className="volunteer-empty"><FaCheckCircle /><h3>No assistance requests available</h3><p>There are currently no unassigned assistance requests.</p></div> : <div className="volunteer-request-list">{assistances.map((request) => <RequestCard key={request._id} request={request} category="Assistance" available />)}</div>}
          </section>
        )}

        {activeSection === "assigned" && (
          <section className="volunteer-content-section full-section">
            <div className="volunteer-section-heading"><div><h2>Assigned Work</h2><p>Requests you have accepted and are currently handling.</p></div><span className="volunteer-section-count">{allAssignedRequests.length} Assigned</span></div>
            {loading ? <div className="volunteer-loading">Loading assigned work...</div> : allAssignedRequests.length === 0 ? <div className="volunteer-empty"><FaClipboardList /><h3>No assigned work yet</h3><p>Accept an emergency or assistance request to start helping.</p></div> : <div className="volunteer-request-list">{allAssignedRequests.map((request) => <RequestCard key={`${request.requestCategory}-${request._id}`} request={request} category={request.requestCategory} />)}</div>}
          </section>
        )}

        {activeSection === "profile" && (
          <section className="volunteer-content-section full-section profile-section">
            <div className="volunteer-section-heading"><div><h2>Volunteer Profile</h2><p>View and manage your ReliefConnect volunteer account.</p></div></div>

            {!profileEditing && !passwordEditing && (
              <div className="volunteer-profile-view">
                <div className="profile-view-header"><div className="profile-avatar-large"><FaUser /></div><div className="profile-view-identity"><h3>{profileData.fullName || "Volunteer"}</h3><span>{profileData.role || "Volunteer"}</span></div></div>
                <div className="profile-information-grid">
                  <div className="profile-information-card"><span>Email Address</span><strong>{profileData.email || "-"}</strong></div>
                  <div className="profile-information-card"><span>Phone Number</span><strong>{profileData.phone || "-"}</strong></div>
                  <div className="profile-information-card"><span>Account Role</span><strong>{profileData.role || "Volunteer"}</strong></div>
                  <div className="profile-information-card profile-address-card"><span>Address</span><strong>{profileData.address || "-"}</strong></div>
                </div>
                {profileMessage && <div className="profile-success"><FaCheckCircle />{profileMessage}</div>}
                <div className="profile-view-actions"><button type="button" className="profile-edit-btn" onClick={openProfileEditor}><FaUser /> Edit Profile</button><button type="button" className="profile-password-btn" onClick={openPasswordEditor}><FaKey /> Change Password</button></div>
              </div>
            )}

            {profileEditing && (
              <form className="volunteer-profile-form" onSubmit={handleProfileSave}>
                <div className="profile-avatar"><div className="profile-avatar-circle"><FaUser /></div><div><h3>{profileData.fullName || "Volunteer"}</h3><p>Editing volunteer account</p></div></div>
                {profileMessage && <div className="profile-success"><FaCheckCircle />{profileMessage}</div>}
                {profileError && <div className="profile-error">{profileError}</div>}
                <div className="profile-form-grid">
                  <div className="profile-field"><label>Full Name</label><input type="text" name="fullName" value={profileData.fullName} onChange={handleProfileChange} required /></div>
                  <div className="profile-field"><label>Email Address</label><input type="email" value={profileData.email} disabled /><small>Email cannot be changed.</small></div>
                  <div className="profile-field"><label>Phone Number</label><input type="text" name="phone" value={profileData.phone} onChange={handleProfileChange} required /></div>
                  <div className="profile-field"><label>Account Role</label><input type="text" value={profileData.role} disabled /><small>Your role is assigned by the system.</small></div>
                  <div className="profile-field profile-field-full"><label>Address</label><textarea name="address" value={profileData.address} onChange={handleProfileChange} rows="4" required /></div>
                </div>
                <div className="profile-form-actions"><button type="button" className="profile-cancel-btn" onClick={cancelProfileEdit} disabled={profileLoading}>Cancel</button><button type="submit" className="profile-save-btn" disabled={profileLoading}>{profileLoading ? "Saving..." : "Save Changes"}</button></div>
              </form>
            )}

            {passwordEditing && (
              <form className="volunteer-password-form" onSubmit={handlePasswordSave}>
                <div className="password-header"><div className="password-header-icon"><FaLock /></div><div><h3>Change Password</h3><p>Keep your volunteer account secure by using a strong password.</p></div></div>
                {passwordMessage && <div className="profile-success password-message"><FaCheckCircle />{passwordMessage}</div>}
                {passwordError && <div className="profile-error password-message">{passwordError}</div>}
                <div className="password-form-fields">
                  <PasswordField label="Current Password" name="currentPassword" value={passwordData.currentPassword} onChange={(e) => setPasswordData((v) => ({ ...v, currentPassword: e.target.value }))} show={showCurrentPassword} setShow={setShowCurrentPassword} autoComplete="current-password" />
                  <PasswordField label="New Password" name="newPassword" value={passwordData.newPassword} onChange={(e) => setPasswordData((v) => ({ ...v, newPassword: e.target.value }))} show={showNewPassword} setShow={setShowNewPassword} autoComplete="new-password" hint="Minimum 6 characters." />
                  <PasswordField label="Confirm New Password" name="confirmPassword" value={passwordData.confirmPassword} onChange={(e) => setPasswordData((v) => ({ ...v, confirmPassword: e.target.value }))} show={showConfirmPassword} setShow={setShowConfirmPassword} autoComplete="new-password" />
                </div>
                <div className="password-security-note"><FaShieldAlt /><div><strong>Password security</strong><p>Never share your password with anyone. Your password is securely encrypted before being stored.</p></div></div>
                <div className="profile-form-actions password-form-actions"><button type="button" className="profile-cancel-btn" onClick={cancelPasswordEdit} disabled={passwordLoading}>Cancel</button><button type="submit" className="profile-password-save-btn" disabled={passwordLoading}><FaLock />{passwordLoading ? "Changing..." : "Change Password"}</button></div>
              </form>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function PasswordField({ label, name, value, onChange, show, setShow, autoComplete, hint }) {
  return (
    <div className="profile-field">
      <label>{label}</label>
      <div className="password-input-wrapper">
        <input type={show ? "text" : "password"} name={name} value={value} onChange={onChange} placeholder={label} autoComplete={autoComplete} minLength="6" required />
        <button type="button" className="password-visibility-btn" onClick={() => setShow((v) => !v)} title={show ? "Hide password" : "Show password"}>
          {show ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      {hint && <small>{hint}</small>}
    </div>
  );
}

export default VolunteerDashboard;
