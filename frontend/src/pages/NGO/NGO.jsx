import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, useMapEvents } from "react-leaflet";
import {
  FaBars,
  FaBell,
  FaBoxOpen,
  FaBuilding,
  FaCheckCircle,
  FaChevronRight,
  FaClipboardList,
  FaCoins,
  FaEdit,
  FaEye,
  FaEyeSlash,
  FaHandsHelping,
  FaHeart,
  FaHistory,
  FaHome,
  FaLock,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaPhone,
  FaPlus,
  FaTrash,
  FaShieldAlt,
  FaSignOutAlt,
  FaTimes,
  FaTint,
  FaTruck,
  FaUserCircle,
  FaUsers,
  FaUtensils,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import "./NGO.css";
import NGOResponseMap from "./NGOResponseMap";

function NGO() {
  const navigate = useNavigate();
  const { user, loading: authLoading, logout } = useAuth();

  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [dashboard, setDashboard] = useState({
    pendingEmergencies: 0,
    pendingAssistance: 0,
    activeRequests: 0,
    handledRequests: 0,
    volunteers: 0,
    donations: 0,
    reliefCamps: 0,
  });
  const [requests, setRequests] = useState({ emergencies: [], assistance: [] });
  const [volunteers, setVolunteers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [camps, setCamps] = useState([]);
  const [contributions, setContributions] = useState([]);

  const [charityForm, setCharityForm] = useState({
    contributionType: "Money",
    amount: "",
    quantity: "",
    itemType: "Food",
    purpose: "General Relief",
    description: "",
  });

  const [selectedVolunteer, setSelectedVolunteer] = useState({});

  const showMessage = (type, text) => {
    setMessage({ type, text });
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  const formatDate = (value) => {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const statusClass = (status) =>
    `ngo-status ngo-status-${String(status || "pending")
      .toLowerCase()
      .replace(/\s+/g, "-")}`;

  const loadAllData = async () => {
    try {
      setLoading(true);
      const results = await Promise.allSettled([
        API.get("/ngo/dashboard"),
        API.get("/ngo/requests"),
        API.get("/ngo/volunteers"),
        API.get("/ngo/donations"),
        API.get("/relief-camps"),
        API.get("/ngo-charity/my-contributions"),
      ]);

      const [dashboardResult, requestsResult, volunteersResult, donationsResult, campsResult, contributionsResult] = results;

      if (dashboardResult.status === "fulfilled") {
        setDashboard(dashboardResult.value.data.stats || dashboardResult.value.data.dashboard || dashboard);
      }
      if (requestsResult.status === "fulfilled") {
        const data = requestsResult.value.data;
        setRequests({
          emergencies: data.emergencies || [],
          assistance: data.assistance || [],
        });
      }
      if (volunteersResult.status === "fulfilled") {
        setVolunteers(volunteersResult.value.data.volunteers || []);
      }
      if (donationsResult.status === "fulfilled") {
        setDonations(donationsResult.value.data.donations || []);
      }
      if (campsResult.status === "fulfilled") {
        setCamps(campsResult.value.data.camps || campsResult.value.data.reliefCamps || []);
      }
      if (contributionsResult.status === "fulfilled") {
        setContributions(contributionsResult.value.data.contributions || []);
      }

      const firstFailure = results.find((item) => item.status === "rejected");
      if (firstFailure) {
        console.warn("Some NGO data could not be loaded:", firstFailure.reason);
      }
    } catch (error) {
      console.error("NGO data loading failed:", error);
      showMessage("error", error.response?.data?.message || "Unable to load NGO data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) loadAllData();
  }, [authLoading, user]);

  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleDirectHelp = async (type, id) => {
    try {
      setActionLoading(true);
      const url = type === "emergency" ? `/ngo/emergency/${id}/status` : `/ngo/assistance/${id}/status`;
      const status = type === "emergency" ? "In Progress" : "In Progress";
      await API.put(url, { status });
      showMessage("success", "The NGO has taken responsibility for this request.");
      await loadAllData();
    } catch (error) {
      showMessage("error", error.response?.data?.message || "Unable to accept this request.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (type, id) => {
    try {
      setActionLoading(true);
      const url = type === "emergency" ? `/ngo/emergency/${id}/status` : `/ngo/assistance/${id}/status`;
      const status = type === "emergency" ? "Resolved" : "Fulfilled";
      await API.put(url, { status });
      showMessage("success", "Request marked as completed.");
      await loadAllData();
    } catch (error) {
      showMessage("error", error.response?.data?.message || "Unable to complete this request.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssign = async (type, id) => {
    const volunteerId = selectedVolunteer[`${type}-${id}`];
    if (!volunteerId) {
      showMessage("error", "Please select a volunteer first.");
      return;
    }

    try {
      setActionLoading(true);
      const url = type === "emergency" ? `/ngo/emergency/${id}/assign` : `/ngo/assistance/${id}/assign`;
      await API.put(url, { volunteerId });
      showMessage("success", "Volunteer assigned successfully.");
      await loadAllData();
    } catch (error) {
      showMessage("error", error.response?.data?.message || "Unable to assign volunteer.");
    } finally {
      setActionLoading(false);
    }
  };

  const updateRequestStatus = async (type, id, status) => {
    try {
      setActionLoading(true);
      const url = type === "emergency" ? `/ngo/emergency/${id}/status` : `/ngo/assistance/${id}/status`;
      await API.put(url, { status });
      showMessage("success", `Request status changed to ${status}.`);
      await loadAllData();
    } catch (error) {
      showMessage("error", error.response?.data?.message || "Unable to update status.");
    } finally {
      setActionLoading(false);
    }
  };

  const updateDonationStatus = async (id, status) => {
    try {
      setActionLoading(true);
      await API.put(`/ngo/donations/${id}/status`, { status });
      showMessage("success", `Donation marked as ${status}.`);
      await loadAllData();
    } catch (error) {
      showMessage("error", error.response?.data?.message || "Unable to update donation.");
    } finally {
      setActionLoading(false);
    }
  };

  const submitCharity = async (event) => {
    event.preventDefault();

    if (charityForm.contributionType === "Money" && Number(charityForm.amount) <= 0) {
      showMessage("error", "Enter a valid contribution amount.");
      return;
    }

    if (charityForm.contributionType === "Supplies" && (!charityForm.quantity || !charityForm.itemType)) {
      showMessage("error", "Enter the supply quantity and type.");
      return;
    }

    try {
      setActionLoading(true);
      await API.post("/ngo-charity/contribute", charityForm);
      setCharityForm({
        contributionType: "Money",
        amount: "",
        quantity: "",
        itemType: "Food",
        purpose: "General Relief",
        description: "",
      });
      showMessage("success", "Your NGO charity contribution has been recorded.");
      await loadAllData();
    } catch (error) {
      showMessage("error", error.response?.data?.message || "Unable to record the contribution.");
    } finally {
      setActionLoading(false);
    }
  };

  const pendingRequests = useMemo(
    () => [
      ...requests.emergencies.map((item) => ({ ...item, requestType: "Emergency", typeKey: "emergency" })),
      ...requests.assistance.map((item) => ({ ...item, requestType: "Assistance", typeKey: "assistance" })),
    ],
    [requests]
  );

  const pageTitle = {
    dashboard: "NGO Dashboard",
    requests: "Help Requests",
    relief: "My Relief Work",
    charity: "NGO Charity",
    donations: "Donations Received",
    camps: "Relief Camps",
    map: "Response Map",
    profile: "NGO Profile",
  }[activeSection];

  if (authLoading || loading) {
    return (
      <div className="ngo-loading-page">
        <div className="ngo-loader" />
        <p>Loading NGO portal...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="ngo-page">
      <aside className={`ngo-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="ngo-sidebar-brand">
          <div className="ngo-brand-icon"><FaHandsHelping /></div>
          <div>
            <h2>ReliefConnect</h2>
            <span>NGO Portal</span>
          </div>
          <button className="ngo-mobile-close" onClick={closeSidebar} aria-label="Close menu">
            <FaTimes />
          </button>
        </div>

        <div className="ngo-user-mini">
          <div className="ngo-mini-avatar"><FaBuilding /></div>
          <div>
            <strong>{user.fullName || "NGO"}</strong>
            <span>Registered NGO</span>
          </div>
        </div>

        <nav className="ngo-sidebar-nav">
          {[
            ["dashboard", <FaHome />, "Dashboard"],
            ["requests", <FaClipboardList />, "Help Requests"],
            ["relief", <FaTruck />, "My Relief Work"],
            ["charity", <FaHeart />, "NGO Charity"],
            ["donations", <FaMoneyBillWave />, "Donations Received"],
            ["camps", <FaBuilding />, "Relief Camps"],
            ["map", <FaMapMarkerAlt />, "Response Map"],
            ["profile", <FaUserCircle />, "My Profile"],
          ].map(([key, icon, label]) => (
            <button
              key={key}
              className={activeSection === key ? "active" : ""}
              onClick={() => { setActiveSection(key); closeSidebar(); }}
            >
              {icon}<span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="ngo-sidebar-bottom">
          <button className="ngo-logout-button" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && <button className="ngo-sidebar-overlay" onClick={closeSidebar} aria-label="Close navigation" />}

      <main className="ngo-main">
        <header className="ngo-topbar">
          <button className="ngo-mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <FaBars />
          </button>
          <div className="ngo-topbar-title">
            <span>ReliefConnect</span>
            <strong>{pageTitle}</strong>
          </div>
          <div className="ngo-top-profile">
            <FaBell />
            <span>{user.fullName}</span>
          </div>
        </header>

        <section className="ngo-content">
          {message.text && (
            <div className={`ngo-message ${message.type}`}>
              {message.type === "success" ? <FaCheckCircle /> : <FaBell />}
              <span>{message.text}</span>
            </div>
          )}

          {activeSection === "dashboard" && (
            <DashboardView dashboard={dashboard} requests={pendingRequests} donations={donations} camps={camps} setActiveSection={setActiveSection} />
          )}

          {activeSection === "requests" && (
            <RequestsView
              requests={pendingRequests}
              volunteers={volunteers}
              selectedVolunteer={selectedVolunteer}
              setSelectedVolunteer={setSelectedVolunteer}
              onDirectHelp={handleDirectHelp}
              onAssign={handleAssign}
              onComplete={handleComplete}
              onStatus={updateRequestStatus}
              actionLoading={actionLoading}
              formatDate={formatDate}
            />
          )}

          {activeSection === "relief" && (
            <ReliefView
              requests={pendingRequests.filter((item) => ["In Progress", "Acknowledged"].includes(item.status))}
              formatDate={formatDate}
              onComplete={handleComplete}
              actionLoading={actionLoading}
            />
          )}

          {activeSection === "charity" && (
            <CharityView
              form={charityForm}
              setForm={setCharityForm}
              contributions={contributions}
              onSubmit={submitCharity}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
              actionLoading={actionLoading}
            />
          )}

          {activeSection === "donations" && (
            <DonationsView
              donations={donations}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
              onStatus={updateDonationStatus}
              actionLoading={actionLoading}
            />
          )}

          {activeSection === "camps" && <CampsView camps={camps} user={user} onRefresh={loadAllData} showMessage={showMessage} />}

          {activeSection === "map" && (
            <NGOResponseMap onBack={() => setActiveSection("dashboard")} />
          )}

          {activeSection === "profile" && <ProfileView user={user} />}
        </section>
      </main>
    </div>
  );
}

function DashboardView({ dashboard, requests, donations, camps, setActiveSection }) {
  const cards = [
    ["Pending Emergencies", dashboard.pendingEmergencies, FaBell, "critical"],
    ["Pending Assistance", dashboard.pendingAssistance, FaHandsHelping, "warning"],
    ["Active Relief Work", dashboard.activeRequests, FaTruck, "blue"],
    ["People Helped", dashboard.handledRequests, FaUsers, "green"],
    ["Volunteers", dashboard.volunteers, FaUsers, "purple"],
    ["Donations Received", dashboard.donations, FaMoneyBillWave, "orange"],
  ];

  return (
    <>
      <div className="ngo-welcome">
        <div>
          <span className="ngo-eyebrow">NGO RESPONSE CENTER</span>
          <h1>Turn support into real relief.</h1>
          <p>Coordinate help seekers, volunteers, donations and relief operations from one place.</p>
        </div>
        <div className="ngo-welcome-icon"><FaHandsHelping /></div>
      </div>

      <div className="ngo-stat-grid">
        {cards.map(([label, value, Icon, tone]) => (
          <div className="ngo-stat-card" key={label}>
            <div className={`ngo-stat-icon ${tone}`}><Icon /></div>
            <div><span>{label}</span><strong>{value || 0}</strong></div>
          </div>
        ))}
      </div>

      <div className="ngo-dashboard-grid">
        <div className="ngo-panel">
          <div className="ngo-panel-header">
            <div><span className="ngo-panel-kicker">ACTION NEEDED</span><h3>Recent Help Requests</h3></div>
            <button onClick={() => setActiveSection("requests")}>View all <FaChevronRight /></button>
          </div>
          {requests.slice(0, 5).map((item) => (
            <div className="ngo-request-row" key={`${item.typeKey}-${item._id}`}>
              <div className="ngo-request-icon"><FaBell /></div>
              <div className="ngo-request-main">
                <strong>{item.requestType} · {item.emergencyType || item.assistanceType}</strong>
                <span>{item.location || "Location not provided"}</span>
              </div>
              <span className={statusClassLocal(item.status)}>{item.status}</span>
            </div>
          ))}
          {!requests.length && <EmptyState text="No pending help requests right now." />}
        </div>

        <div className="ngo-panel">
          <div className="ngo-panel-header">
            <div><span className="ngo-panel-kicker">OPERATIONS</span><h3>Quick Overview</h3></div>
          </div>
          <div className="ngo-overview-list">
            <button onClick={() => setActiveSection("charity")}><FaHeart /><span>Make an NGO charity contribution</span><FaChevronRight /></button>
            <button onClick={() => setActiveSection("donations")}><FaMoneyBillWave /><span>Review incoming donations</span><FaChevronRight /></button>
            <button onClick={() => setActiveSection("camps")}><FaBuilding /><span>Check relief camp capacity</span><FaChevronRight /></button>
          </div>
          <div className="ngo-mini-summary">
            <span>Relief Camps</span><strong>{camps.length}</strong>
          </div>
          <div className="ngo-mini-summary">
            <span>Recent Donations</span><strong>{donations.length}</strong>
          </div>
        </div>
      </div>
    </>
  );
}

function RequestsView({ requests, volunteers, selectedVolunteer, setSelectedVolunteer, onDirectHelp, onAssign, onComplete, onStatus, actionLoading, formatDate }) {
  return (
    <div className="ngo-section-stack">
      <SectionIntro eyebrow="COMMUNITY RESPONSE" title="Help people who need support" text="Your NGO can directly handle a request or coordinate a volunteer to respond." />
      <div className="ngo-request-list">
        {requests.map((item) => (
          <div className="ngo-large-card" key={`${item.typeKey}-${item._id}`}>
            <div className="ngo-card-topline">
              <div>
                <span className="ngo-type-label">{item.requestType}</span>
                <h3>{item.emergencyType || item.assistanceType || "Relief Request"}</h3>
              </div>
              <span className={statusClassLocal(item.status)}>{item.status}</span>
            </div>
            <div className="ngo-request-meta">
              <span><FaMapMarkerAlt /> {item.location || "Location not provided"}</span>
              <span><FaPhone /> {item.contactNumber || "No contact"}</span>
              <span><FaHistory /> {formatDate(item.createdAt)}</span>
            </div>
            <p className="ngo-description">{item.description || "No additional description provided."}</p>
            <div className="ngo-card-actions">
              {(item.status === "Pending" || item.status === "Acknowledged") && (
                <button className="ngo-primary-btn" disabled={actionLoading} onClick={() => onDirectHelp(item.typeKey, item._id)}>
                  <FaHandsHelping /> Handle Directly
                </button>
              )}
              <select
                value={selectedVolunteer[`${item.typeKey}-${item._id}`] || ""}
                onChange={(e) => setSelectedVolunteer((prev) => ({ ...prev, [`${item.typeKey}-${item._id}`]: e.target.value }))}
              >
                <option value="">Assign a volunteer...</option>
                {volunteers.map((volunteer) => (
                  <option key={volunteer._id} value={volunteer._id}>{volunteer.fullName}</option>
                ))}
              </select>
              <button className="ngo-secondary-btn" disabled={actionLoading} onClick={() => onAssign(item.typeKey, item._id)}>
                <FaUsers /> Assign Volunteer
              </button>
              {item.status === "In Progress" && (
                <button className="ngo-success-btn" disabled={actionLoading} onClick={() => onComplete(item.typeKey, item._id)}>
                  <FaCheckCircle /> Complete
                </button>
              )}
              {item.status === "Pending" && (
                <button className="ngo-link-btn" disabled={actionLoading} onClick={() => onStatus(item.typeKey, item._id, "Acknowledged")}>
                  Acknowledge
                </button>
              )}
            </div>
          </div>
        ))}
        {!requests.length && <EmptyState text="There are no active help requests." />}
      </div>
    </div>
  );
}

function ReliefView({ requests, formatDate, onComplete, actionLoading }) {
  return (
    <div className="ngo-section-stack">
      <SectionIntro eyebrow="FIELD OPERATIONS" title="My Relief Work" text="Track cases currently being handled by your NGO team." />
      <div className="ngo-relief-grid">
        {requests.map((item) => (
          <div className="ngo-relief-card" key={`${item.typeKey}-${item._id}`}>
            <div className="ngo-relief-card-head">
              <span>{item.requestType}</span><span className={statusClassLocal(item.status)}>{item.status}</span>
            </div>
            <h3>{item.emergencyType || item.assistanceType}</h3>
            <p><FaMapMarkerAlt /> {item.location}</p>
            <p><FaHistory /> Started {formatDate(item.updatedAt || item.createdAt)}</p>
            <button className="ngo-success-btn wide" onClick={() => onComplete(item.typeKey, item._id)} disabled={actionLoading}>
              <FaCheckCircle /> Mark Relief Completed
            </button>
          </div>
        ))}
        {!requests.length && <EmptyState text="No active relief work at the moment." />}
      </div>
    </div>
  );
}

function CharityView({ form, setForm, contributions, onSubmit, formatDate, formatCurrency, actionLoading }) {
  return (
    <div className="ngo-section-stack">
      <SectionIntro eyebrow="NGO CHARITY" title="Give directly to relief operations" text="Your NGO can contribute money or essential supplies to help people affected by disasters." />
      <div className="ngo-charity-grid">
        <form className="ngo-panel ngo-form-panel" onSubmit={onSubmit}>
          <div className="ngo-panel-header"><div><span className="ngo-panel-kicker">NEW CONTRIBUTION</span><h3>Make a contribution</h3></div></div>
          <label>Contribution Type</label>
          <select value={form.contributionType} onChange={(e) => setForm({ ...form, contributionType: e.target.value })}>
            <option value="Money">Money</option><option value="Supplies">Relief Supplies</option>
          </select>
          {form.contributionType === "Money" ? (
            <>
              <label>Amount (₹)</label>
              <input type="number" min="1" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="Enter amount" />
            </>
          ) : (
            <div className="ngo-form-row">
              <div><label>Supply Type</label><select value={form.itemType} onChange={(e) => setForm({ ...form, itemType: e.target.value })}><option>Food</option><option>Water</option><option>Medical Supplies</option><option>Clothes</option><option>Essential Supplies</option></select></div>
              <div><label>Quantity</label><input value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="e.g. 100 kits" /></div>
            </div>
          )}
          <label>Purpose</label>
          <select value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })}>
            <option>General Relief</option><option>Food Relief</option><option>Medical Relief</option><option>Shelter Support</option><option>Emergency Response</option>
          </select>
          <label>Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="4" placeholder="Describe how this contribution will support relief work." />
          <button className="ngo-primary-btn wide" disabled={actionLoading}><FaHeart /> {actionLoading ? "Recording..." : "Contribute to Relief"}</button>
        </form>

        <div className="ngo-panel">
          <div className="ngo-panel-header"><div><span className="ngo-panel-kicker">HISTORY</span><h3>My NGO Contributions</h3></div></div>
          <div className="ngo-contribution-list">
            {contributions.map((item) => (
              <div className="ngo-contribution-row" key={item._id}>
                <div className="ngo-contribution-icon"><FaHeart /></div>
                <div><strong>{item.contributionType === "Money" ? formatCurrency(item.amount) : `${item.quantity} ${item.itemType || "supplies"}`}</strong><span>{item.purpose} · {formatDate(item.createdAt)}</span></div>
                <span className={statusClassLocal(item.status)}>{item.status}</span>
              </div>
            ))}
            {!contributions.length && <EmptyState text="No NGO charity contributions recorded yet." />}
          </div>
        </div>
      </div>
    </div>
  );
}

function DonationsView({ donations, formatDate, formatCurrency, onStatus, actionLoading }) {
  return (
    <div className="ngo-section-stack">
      <SectionIntro eyebrow="DONATIONS RECEIVED" title="Manage support from donors" text="Verify incoming donations and record when relief resources are put into use." />
      <div className="ngo-table-wrap">
        <table className="ngo-table">
          <thead><tr><th>Reference</th><th>Donor</th><th>Type</th><th>Amount</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {donations.map((item) => (
              <tr key={item._id}>
                <td>{item.referenceId || "—"}</td>
                <td>{item.donor?.fullName || "Donor"}</td>
                <td>{item.donationType}</td>
                <td>{formatCurrency(item.amount)}</td>
                <td>{formatDate(item.createdAt)}</td>
                <td><span className={statusClassLocal(item.status)}>{item.status}</span></td>
                <td>
                  {item.status === "Recorded" && <button className="ngo-small-btn" disabled={actionLoading} onClick={() => onStatus(item._id, "Verified")}>Verify</button>}
                  {item.status === "Verified" && <button className="ngo-small-btn success" disabled={actionLoading} onClick={() => onStatus(item._id, "Used")}>Mark Used</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!donations.length && <EmptyState text="No incoming donations found." />}
      </div>
    </div>
  );
}

function CampLocationPicker({ latitude, longitude, onChange }) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  const hasLocation = Number.isFinite(lat) && Number.isFinite(lng);
  const center = hasLocation ? [lat, lng] : [13.0827, 80.2707];

  const LocationEvents = () => {
    useMapEvents({
      click(event) {
        onChange(event.latlng.lat, event.latlng.lng);
      },
    });
    return null;
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      window.alert("Location services are not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange(position.coords.latitude, position.coords.longitude);
      },
      () => {
        window.alert("Unable to get your current location. Please select the camp location directly on the map.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="ngo-camp-location-picker">
      <div className="ngo-camp-location-picker-head">
        <div>
          <strong>Select Camp Location on Map</strong>
          <span>Click on the map where the relief camp is located, or use your current location.</span>
        </div>
        <button type="button" className="ngo-map-location-btn" onClick={useCurrentLocation}>
          <FaMapMarkerAlt /> Use My Location
        </button>
      </div>

      <div className="ngo-camp-picker-map">
        <MapContainer key={`${center[0]}-${center[1]}`} center={center} zoom={hasLocation ? 15 : 11} scrollWheelZoom>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationEvents />
          {hasLocation && (
            <CircleMarker
              center={[lat, lng]}
              radius={10}
              pathOptions={{ color: "#dc2626", fillColor: "#ef4444", fillOpacity: 0.8 }}
            />
          )}
        </MapContainer>
      </div>

      <div className="ngo-camp-coordinates">
        <span>Latitude: <strong>{hasLocation ? lat.toFixed(6) : "Not selected"}</strong></span>
        <span>Longitude: <strong>{hasLocation ? lng.toFixed(6) : "Not selected"}</strong></span>
      </div>
    </div>
  );
}

function CampsView({ camps, user, onRefresh, showMessage }) {
  const blankForm = {
    name: "",
    location: "",
    contactNumber: "",
    capacity: "",
    occupied: "0",
    facilities: "",
    status: "Open",
    latitude: "",
    longitude: "",
    description: "",
  };

  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const isOwnedByCurrentNGO = (camp) => {
    const owner = camp?.managedByNGO;
    const ownerId = owner?._id || owner;
    return ownerId && user?._id && String(ownerId) === String(user._id);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(blankForm);
    setShowForm(true);
  };

  const openEdit = (camp) => {
    if (!isOwnedByCurrentNGO(camp)) return;

    setEditingId(camp._id);
    setForm({
      name: camp.name || "",
      location: camp.location || "",
      contactNumber: camp.contactNumber || "",
      capacity: camp.capacity ?? "",
      occupied: camp.occupied ?? 0,
      facilities: Array.isArray(camp.facilities)
        ? camp.facilities.join(", ")
        : camp.facilities || "",
      status: camp.status || "Open",
      latitude: camp.latitude ?? "",
      longitude: camp.longitude ?? "",
      description: camp.description || "",
    });
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
    setEditingId(null);
    setForm(blankForm);
  };

  const setCampLocation = (latitude, longitude) => {
    setForm((current) => ({
      ...current,
      latitude: String(latitude),
      longitude: String(longitude),
    }));
  };

  const saveCamp = async (event) => {
    event.preventDefault();

    const capacity = Number(form.capacity);
    const occupied = Number(form.occupied || 0);
    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);

    if (!form.name.trim() || !form.location.trim()) {
      showMessage("error", "Camp name and location are required.");
      return;
    }

    if (!Number.isFinite(capacity) || capacity < 1) {
      showMessage("error", "Capacity must be at least 1.");
      return;
    }

    if (!Number.isFinite(occupied) || occupied < 0 || occupied > capacity) {
      showMessage("error", "Occupied capacity must be between 0 and total capacity.");
      return;
    }

    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      showMessage("error", "Please select the relief camp location on the map before saving.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        location: form.location.trim(),
        contactNumber: form.contactNumber.trim(),
        capacity,
        occupied,
        facilities: String(form.facilities || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        status: form.status,
        description: form.description.trim(),
        latitude,
        longitude,
      };

      if (editingId) {
        await API.put(`/ngo/camps/${editingId}`, payload);
        showMessage("success", "Your NGO relief camp has been updated successfully.");
      } else {
        await API.post("/ngo/camps", payload);
        showMessage("success", "Your NGO relief camp has been created successfully.");
      }

      closeForm();
      await onRefresh();
    } catch (error) {
      console.error("NGO camp save error:", error);
      showMessage("error", error.response?.data?.message || "Unable to save the relief camp.");
    } finally {
      setSaving(false);
    }
  };

  const deleteCamp = async (camp) => {
    if (!isOwnedByCurrentNGO(camp)) return;

    const confirmed = window.confirm(
      `Delete "${camp.name}"? This will remove the NGO-managed relief camp.`
    );
    if (!confirmed) return;

    try {
      setSaving(true);
      await API.delete(`/ngo/camps/${camp._id}`);
      showMessage("success", "Relief camp deleted successfully.");
      await onRefresh();
    } catch (error) {
      console.error("NGO camp delete error:", error);
      showMessage("error", error.response?.data?.message || "Unable to delete the relief camp.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ngo-section-stack">
      <SectionIntro
        eyebrow="RELIEF CAMPS"
        title="Monitor shelter operations"
        text="View available camps and manage the camps created by your NGO."
      />

      <div className="ngo-camps-toolbar">
        <div>
          <strong>{camps.length} relief camp{camps.length === 1 ? "" : "s"}</strong>
          <span>Government and NGO camps are visible here. Only your NGO camps can be edited.</span>
        </div>
        <button type="button" className="ngo-create-camp-btn" onClick={openCreate}>
          <FaPlus /> Create NGO Camp
        </button>
      </div>

      <div className="ngo-camp-grid">
        {camps.map((camp) => {
          const capacity = Number(camp.capacity || 0);
          const occupied = Number(camp.occupied || 0);
          const percentage = capacity
            ? Math.min(100, Math.round((occupied / capacity) * 100))
            : 0;
          const owned = isOwnedByCurrentNGO(camp);

          return (
            <div className="ngo-camp-card" key={camp._id}>
              <div className="ngo-camp-card-topline">
                <div className="ngo-camp-icon"><FaBuilding /></div>
                <span className={`ngo-camp-status ${String(camp.status || "").toLowerCase().replace(/\s+/g, "-")}`}>
                  {camp.status || "Open"}
                </span>
              </div>

              <h3>{camp.name}</h3>
              <p><FaMapMarkerAlt /> {camp.location}</p>

              <div className="ngo-capacity">
                <div>
                  <span>Occupancy</span>
                  <strong>{occupied} / {capacity || "—"}</strong>
                </div>
                <div className="ngo-capacity-bar"><span style={{ width: `${percentage}%` }} /></div>
              </div>

              <p className="ngo-facilities">
                {Array.isArray(camp.facilities)
                  ? camp.facilities.join(" • ") || "Facilities not listed"
                  : camp.facilities || "Facilities not listed"}
              </p>

              <div className="ngo-camp-owner-row">
                {owned ? (
                  <span className="ngo-camp-owner-badge">Managed by your NGO</span>
                ) : (
                  <span className="ngo-camp-owner-badge other">View only</span>
                )}

                {owned && (
                  <div className="ngo-camp-actions">
                    <button type="button" onClick={() => openEdit(camp)} disabled={saving} title="Edit camp">
                      <FaEdit /> Edit
                    </button>
                    <button type="button" className="danger" onClick={() => deleteCamp(camp)} disabled={saving} title="Delete camp">
                      <FaTrash /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {!camps.length && <EmptyState text="No relief camps are currently available." />}
      </div>

      {showForm && (
        <div className="ngo-modal-backdrop">
          <div className="ngo-camp-modal">
            <div className="ngo-camp-modal-header">
              <div>
                <span>NGO RELIEF OPERATIONS</span>
                <h2>{editingId ? "Edit NGO Relief Camp" : "Create NGO Relief Camp"}</h2>
              </div>
              <button type="button" className="ngo-modal-close" onClick={closeForm} disabled={saving}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={saveCamp}>
              <div className="ngo-camp-form-grid">
                <label>Camp Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
                <label>Contact Number<input value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} /></label>
                <label className="full">Location<input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required /></label>
                <label>Capacity<input type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} required /></label>
                <label>Occupied<input type="number" min="0" value={form.occupied} onChange={(e) => setForm({ ...form, occupied: e.target.value })} /></label>
                <label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Open</option><option>Limited Capacity</option><option>Full</option><option>Closed</option></select></label>
                <label className="full">Facilities <span>(comma separated)</span><input value={form.facilities} onChange={(e) => setForm({ ...form, facilities: e.target.value })} placeholder="Food, Water, Medical Help, Shelter" /></label>
                <label className="full">Description<textarea rows="4" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
              </div>

              <CampLocationPicker
                latitude={form.latitude}
                longitude={form.longitude}
                onChange={setCampLocation}
              />

              <div className="ngo-camp-form-actions">
                <button type="button" className="ngo-profile-cancel-btn" onClick={closeForm} disabled={saving}>Cancel</button>
                <button type="submit" className="ngo-create-camp-btn" disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Update Camp" : "Create Camp"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileView({ user }) {
  const { updateProfile } = useAuth();

  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setProfileForm({
      fullName: user?.fullName || "",
      phone: user?.phone || "",
      address: user?.address || "",
    });
  }, [user]);

  const saveProfile = async (event) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });

    try {
      setSaving(true);
      await updateProfile({
        fullName: profileForm.fullName,
        phone: profileForm.phone,
        address: profileForm.address,
      });
      setEditing(false);
      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });

    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "Please fill in all password fields." });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "New password must contain at least 6 characters." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New password and confirmation password do not match." });
      return;
    }

    if (currentPassword === newPassword) {
      setMessage({ type: "error", text: "New password must be different from your current password." });
      return;
    }

    try {
      setPasswordSaving(true);
      const response = await API.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setChangingPassword(false);
      setMessage({
        type: "success",
        text: response.data?.message || "Password changed successfully.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to change password.",
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  const cancelEditing = () => {
    setEditing(false);
    setProfileForm({
      fullName: user?.fullName || "",
      phone: user?.phone || "",
      address: user?.address || "",
    });
  };

  const cancelPassword = () => {
    setChangingPassword(false);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  return (
    <div className="ngo-section-stack">
      <SectionIntro
        eyebrow="ORGANIZATION PROFILE"
        title="NGO Profile"
        text="View and manage your organization details and account security."
      />

      {message.text && (
        <div className={`ngo-profile-message ${message.type}`}>
          {message.type === "success" ? <FaCheckCircle /> : <FaBell />}
          <span>{message.text}</span>
        </div>
      )}

      {!editing && !changingPassword && (
        <div className="ngo-profile-card ngo-profile-card-enhanced">
          <div className="ngo-profile-avatar"><FaBuilding /></div>

          <div className="ngo-profile-details">
            <div><span>Organization / Name</span><strong>{user?.fullName || "—"}</strong></div>
            <div><span>Email</span><strong>{user?.email || "—"}</strong></div>
            <div><span>Phone</span><strong>{user?.phone || "—"}</strong></div>
            <div><span>Address</span><strong>{user?.address || "—"}</strong></div>
            <div><span>Role</span><strong>{user?.role || "NGO"}</strong></div>
          </div>

          <div className="ngo-profile-actions">
            <button type="button" className="ngo-profile-edit-btn" onClick={() => { setMessage({ type: "", text: "" }); setEditing(true); }}>
              <FaEdit /> Edit Profile
            </button>
            <button type="button" className="ngo-profile-password-btn" onClick={() => { setMessage({ type: "", text: "" }); setChangingPassword(true); }}>
              <FaLock /> Change Password
            </button>
          </div>
        </div>
      )}

      {editing && (
        <form className="ngo-profile-editor-card" onSubmit={saveProfile}>
          <div className="ngo-profile-editor-heading">
            <div>
              <span>ACCOUNT SETTINGS</span>
              <h2>Edit NGO Profile</h2>
            </div>
            <FaEdit />
          </div>

          <div className="ngo-profile-form-grid">
            <label>
              Full Name / Organization Name
              <input
                value={profileForm.fullName}
                onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                required
              />
            </label>
            <label>
              Email Address
              <input value={user?.email || ""} disabled />
              <small>Email address cannot be changed from the profile section.</small>
            </label>
            <label>
              Phone Number
              <input
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              />
            </label>
            <label>
              Address
              <input
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
              />
            </label>
          </div>

          <div className="ngo-profile-form-actions">
            <button type="button" className="ngo-profile-cancel-btn" onClick={cancelEditing} disabled={saving}>Cancel</button>
            <button type="submit" className="ngo-profile-save-btn" disabled={saving}>
              <FaCheckCircle /> {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      )}

      {changingPassword && (
        <form className="ngo-profile-editor-card ngo-password-card" onSubmit={savePassword}>
          <div className="ngo-profile-editor-heading">
            <div>
              <span>ACCOUNT SECURITY</span>
              <h2>Change Password</h2>
            </div>
            <FaLock />
          </div>

          <div className="ngo-password-security-note">
            <FaShieldAlt />
            <p>Use at least 6 characters and never share your password with anyone.</p>
          </div>

          <div className="ngo-profile-form-grid">
            {[
              ["Current Password", "currentPassword", showCurrent, setShowCurrent, "current-password"],
              ["New Password", "newPassword", showNew, setShowNew, "new-password"],
              ["Confirm New Password", "confirmPassword", showConfirm, setShowConfirm, "new-password"],
            ].map(([label, name, visible, setVisible, autoComplete]) => (
              <label key={name} className="ngo-password-field">
                {label}
                <div className="ngo-password-input-wrap">
                  <input
                    type={visible ? "text" : "password"}
                    name={name}
                    value={passwordForm[name]}
                    onChange={(e) => setPasswordForm({ ...passwordForm, [name]: e.target.value })}
                    autoComplete={autoComplete}
                    minLength={name !== "currentPassword" ? 6 : undefined}
                    required
                  />
                  <button type="button" onClick={() => setVisible(!visible)} title={visible ? "Hide password" : "Show password"}>
                    {visible ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </label>
            ))}
          </div>

          <div className="ngo-profile-form-actions">
            <button type="button" className="ngo-profile-cancel-btn" onClick={cancelPassword} disabled={passwordSaving}>Cancel</button>
            <button type="submit" className="ngo-profile-password-save-btn" disabled={passwordSaving}>
              <FaLock /> {passwordSaving ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function SectionIntro({ eyebrow, title, text }) {
  return <div className="ngo-section-intro"><span>{eyebrow}</span><h1>{title}</h1><p>{text}</p></div>;
}

function EmptyState({ text }) {
  return <div className="ngo-empty"><FaClipboardList /><p>{text}</p></div>;
}

function statusClassLocal(status) {
  return `ngo-status ngo-status-${String(status || "pending").toLowerCase().replace(/\s+/g, "-")}`;
}

export default NGO;
