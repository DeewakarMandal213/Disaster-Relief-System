import { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  FaArrowRight,
  FaBars,
  FaBell,
  FaBuilding,
  FaCampground,
  FaChartLine,
  FaCheck,
  FaCheckCircle,
  FaChevronRight,
  FaClipboardCheck,
  FaClock,
  FaCog,
  FaDonate,
  FaEdit,
  FaExclamationTriangle,
  FaFileAlt,
  FaHandsHelping,
  FaHome,
  FaMapMarkedAlt,
  FaPeopleArrows,
  FaPlus,
  FaSave,
  FaSearch,
  FaShieldAlt,
  FaSignOutAlt,
  FaTrash,
  FaTimes,
  FaUserShield,
  FaUsers,
  FaWarehouse,
  FaSyncAlt,
  FaBullhorn,
} from "react-icons/fa";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Admin.css";

const EMPTY = { emergencies: [], assistance: [], camps: [], ngos: [], volunteers: [], donations: [], operations: [], users: [] };
const resolved = ["Resolved", "Rejected", "Fulfilled", "Completed", "Cancelled", "Closed", "Used", "Distributed"];
const active = (status) => !resolved.includes(String(status || "").trim());
const fmt = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};
const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState(EMPTY);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [mapData, setMapData] = useState({ emergencies: [], assistance: [], camps: [] });
  const [reports, setReports] = useState(null);
  const [logs, setLogs] = useState([]);
  const [settings, setSettings] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [ngoContributions, setNgoContributions] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});

  const loadOverview = useCallback(async (silent = false) => {
    try {
      silent ? setRefreshing(true) : setLoading(true);
      setError("");
      const res = await API.get("/admin/overview");
      setData({ ...EMPTY, ...(res.data?.data || {}) });
      setStats(res.data?.stats || {});
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load Admin Portal data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadView = useCallback(async (currentView) => {
    try {
      if (["dashboard", "command"].includes(currentView)) return;
      if (currentView === "map") setMapData((await API.get("/admin/map")).data || { emergencies: [], assistance: [], camps: [] });
      if (currentView === "emergencies") { const r = await API.get("/admin/emergencies"); setData((d) => ({ ...d, emergencies: r.data?.emergencies || [] })); }
      if (currentView === "assistance") { const r = await API.get("/admin/assistance"); setData((d) => ({ ...d, assistance: r.data?.assistance || [] })); }
      if (currentView === "camps") { const r = await API.get("/admin/camps"); setData((d) => ({ ...d, camps: r.data?.camps || [] })); }
      if (currentView === "operations") { const r = await API.get("/admin/operations"); setData((d) => ({ ...d, operations: r.data?.operations || [] })); }
      if (currentView === "ngos") { const r = await API.get("/admin/ngos"); setData((d) => ({ ...d, ngos: r.data?.users || [] })); }
      if (currentView === "volunteers") { const r = await API.get("/admin/volunteers"); setData((d) => ({ ...d, volunteers: r.data?.users || [] })); }
      if (currentView === "users") { const r = await API.get("/admin/users"); setData((d) => ({ ...d, users: r.data?.users || [] })); }
      if (currentView === "donations") { const r = await API.get("/admin/donations"); setData((d) => ({ ...d, donations: r.data?.donations || [] })); setNgoContributions(r.data?.ngoContributions || []); }
      if (currentView === "distribution") setDistributions((await API.get("/admin/distribution")).data?.distributions || []);
      if (currentView === "approvals") setApprovals((await API.get("/admin/approvals")).data?.approvals || []);
      if (currentView === "reports") setReports((await API.get("/admin/reports")).data?.report || null);
      if (currentView === "announcements") setAnnouncements((await API.get("/admin/announcements")).data?.announcements || []);
      if (currentView === "logs") setLogs((await API.get("/admin/logs")).data?.logs || []);
      if (currentView === "settings") setSettings((await API.get("/admin/settings")).data?.settings || []);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to load ${currentView}.`);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "Admin") {
      navigate("/login", { replace: true });
      return;
    }
    loadOverview();
  }, [user, navigate, loadOverview]);

  useEffect(() => { if (user?.role === "Admin") loadView(view); }, [view, user, loadView]);

  const flash = (text) => { setMessage(text); window.setTimeout(() => setMessage(""), 2800); };
  const go = (next) => { setView(next); setSidebarOpen(false); setSearch(""); setError(""); };
  const closeModal = () => { setModal(null); setForm({}); };
  const submit = async (request, successText) => {
    try { const res = await request(); flash(res.data?.message || successText); closeModal(); await loadOverview(true); await loadView(view); }
    catch (err) { setError(err.response?.data?.message || "Action failed."); }
  };
  const logoutAdmin = () => { logout(); navigate("/login"); };

  const activeEmergencies = data.emergencies.filter((x) => active(x.status));
  const activeAssistance = data.assistance.filter((x) => active(x.status));
  const critical = activeEmergencies.filter((x) => String(x.severity).toLowerCase() === "critical");
  const highAssistance = activeAssistance.filter((x) => ["High", "Critical"].includes(x.priority));
  const limitedCamps = data.camps.filter((x) => ["Limited Capacity", "Full"].includes(x.status));
  const totalCapacity = data.camps.reduce((a, x) => a + Number(x.capacity || 0), 0);
  const occupied = data.camps.reduce((a, x) => a + Number(x.occupied || 0), 0);
  const occupancy = totalCapacity ? Math.round((occupied / totalCapacity) * 100) : 0;
  const donationTotal = data.donations.reduce((a, x) => a + Number(x.amount || 0), 0);

  const menu = [
    ["Overview", [["dashboard", "Dashboard", FaHome], ["command", "Command Center", FaShieldAlt], ["map", "Disaster Map", FaMapMarkedAlt]]],
    ["Operations", [["emergencies", "Emergencies", FaExclamationTriangle], ["assistance", "Assistance Requests", FaHandsHelping], ["camps", "Relief Camps", FaCampground], ["operations", "Operations", FaPeopleArrows]]],
    ["People & Organizations", [["ngos", "NGOs", FaBuilding], ["volunteers", "Volunteers", FaUsers], ["users", "Citizens / Users", FaUserShield]]],
    ["Resources", [["donations", "Donations", FaDonate], ["distribution", "Distribution", FaWarehouse]]],
    ["Administration", [["approvals", "Approvals", FaClipboardCheck], ["reports", "Reports & Analytics", FaChartLine], ["announcements", "Announcements", FaBullhorn], ["logs", "Activity Logs", FaFileAlt], ["settings", "System Settings", FaCog]]],
  ];

  const priorityCases = [
    ...critical.map((x) => ({ id: x._id, title: x.emergencyType || "Emergency", location: x.location, status: x.status, priority: "Critical", type: "Emergency", target: "emergencies", icon: FaExclamationTriangle, tone: "red" })),
    ...highAssistance.map((x) => ({ id: x._id, title: x.assistanceType || "Assistance", location: x.location, status: x.status, priority: x.priority, type: "Assistance", target: "assistance", icon: FaHandsHelping, tone: "amber" })),
    ...limitedCamps.map((x) => ({ id: x._id, title: x.name, location: x.location, status: x.status, priority: "Capacity", type: "Relief Camp", target: "camps", icon: FaCampground, tone: "blue" })),
  ].slice(0, 8);

  const statCards = [
    ["Active Emergencies", stats.activeEmergencies ?? activeEmergencies.length, FaExclamationTriangle, "red"],
    ["Active Assistance", stats.activeAssistance ?? activeAssistance.length, FaHandsHelping, "green"],
    ["Relief Camps", stats.reliefCamps ?? data.camps.length, FaCampground, "blue"],
    ["Active Operations", stats.activeOperations ?? data.operations.filter((x) => ["Planned", "In Progress"].includes(x.status)).length, FaPeopleArrows, "purple"],
    ["Active NGOs", stats.ngos ?? data.ngos.length, FaBuilding, "cyan"],
    ["Volunteers", stats.volunteers ?? data.volunteers.length, FaUsers, "slate"],
    ["Total Users", stats.totalUsers ?? data.users.length ?? 0, FaUserShield, "amber"],
    ["Donation Records", stats.donationRecords ?? data.donations.length, FaDonate, "indigo"],
  ];

  const filtered = (items, fields = []) => items.filter((item) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return fields.some((field) => String(field.split(".").reduce((o, k) => o?.[k], item) ?? "").toLowerCase().includes(q));
  });

  const titleMap = { dashboard: "Administration Dashboard", command: "Admin Command Center", map: "Disaster Map", emergencies: "Emergency Management", assistance: "Assistance Request Management", camps: "Relief Camp Management", operations: "Operations Management", ngos: "NGO Management", volunteers: "Volunteer Management", users: "Citizen / User Management", donations: "Donations Management", distribution: "Relief Distribution", approvals: "Approval Center", reports: "Reports & Analytics", announcements: "Announcements", logs: "Activity Logs", settings: "System Settings" };

  if (!user || loading) return <div className="admin-loading"><FaSyncAlt className="spin" /> Loading Admin Portal...</div>;

  return (
    <div className="admin-page">
      {sidebarOpen && <button className="admin-overlay" onClick={() => setSidebarOpen(false)} aria-label="Close menu" />}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="admin-brand"><div className="admin-brand-mark"><FaShieldAlt /></div><div><strong>ReliefConnect</strong><span>Administration</span></div><button className="mobile-close" onClick={() => setSidebarOpen(false)}><FaTimes /></button></div>
        <div className="admin-access"><div><FaUserShield /></div><span>ACCESS LEVEL<strong>System Administrator</strong></span></div>
        <nav className="admin-nav">
          {menu.map(([group, items]) => <div className="admin-nav-group" key={group}><p>{group}</p>{items.map(([id, label, Icon]) => <button key={id} className={`admin-nav-item ${view === id ? "active" : ""}`} onClick={() => go(id)}><Icon /><span>{label}</span></button>)}</div>)}
        </nav>
        <div className="admin-side-footer"><div className="admin-side-user"><div className="admin-avatar">{(user.fullName || "A")[0].toUpperCase()}</div><div><strong>{user.fullName || "Administrator"}</strong><span>{user.role}</span></div></div><button onClick={logoutAdmin}><FaSignOutAlt /> Logout</button></div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="top-left"><button className="mobile-menu" onClick={() => setSidebarOpen(true)}><FaBars /></button><div><span>ADMINISTRATION / {view.toUpperCase()}</span><h1>{titleMap[view]}</h1></div></div>
          <div className="top-actions"><button onClick={() => { loadOverview(true); loadView(view); }} disabled={refreshing}><FaSyncAlt className={refreshing ? "spin" : ""} /> Refresh</button><div className="top-bell"><FaBell />{critical.length + highAssistance.length > 0 && <b>{critical.length + highAssistance.length}</b>}</div><div className="top-user"><div className="admin-avatar">{(user.fullName || "A")[0].toUpperCase()}</div><span><strong>{user.fullName}</strong><small>System Administrator</small></span></div></div>
        </header>

        <div className="admin-content">
          {error && <div className="admin-alert error"><FaExclamationTriangle /><span>{error}</span><button onClick={() => setError("")}><FaTimes /></button></div>}
          {message && <div className="admin-alert success"><FaCheckCircle /><span>{message}</span></div>}
          {view === "dashboard" && <Dashboard stats={stats} cards={statCards} critical={critical} highAssistance={highAssistance} limitedCamps={limitedCamps} occupancy={occupancy} totalCapacity={totalCapacity} occupied={occupied} donationTotal={donationTotal} data={data} go={go} fmt={fmt} />}
          {view === "command" && <CommandCenter priorityCases={priorityCases} stats={statCards} go={go} />}
          {view === "map" && <MapView data={mapData} />}
          {view === "emergencies" && <RequestTable type="emergencies" rows={filtered(data.emergencies, ["emergencyType", "location", "status", "severity"])} onEdit={(row) => { setForm({ status: row.status, severity: row.severity, handledByNGO: row.handledByNGO?._id || "", assignedVolunteer: row.assignedVolunteer?._id || "" }); setModal({ type: "emergency", row }); }} />}
          {view === "assistance" && <RequestTable type="assistance" rows={filtered(data.assistance, ["assistanceType", "location", "status", "priority"])} onEdit={(row) => { setForm({ status: row.status, priority: row.priority, handledByNGO: row.handledByNGO?._id || "", assignedVolunteer: row.assignedVolunteer?._id || "" }); setModal({ type: "assistance", row }); }} />}
          {view === "camps" && <CampsView rows={filtered(data.camps, ["name", "location", "status"])} onCreate={() => { setForm({ name: "", location: "", contactNumber: "", capacity: 100, occupied: 0, facilities: "", status: "Open", latitude: "", longitude: "", description: "" }); setModal({ type: "camp" }); }} onEdit={(row) => { setForm({ ...row, facilities: Array.isArray(row.facilities) ? row.facilities.join(", ") : row.facilities || "" }); setModal({ type: "camp", row }); }} onDelete={(row) => submit(() => API.delete(`/admin/camps/${row._id}`), "Relief camp deleted.")} />}
          {view === "operations" && <OperationsView rows={filtered(data.operations, ["title", "operationType", "location", "status"])} onCreate={() => { setForm({ title: "", operationType: "Direct Assistance", location: "", affectedPeople: 0, description: "", status: "Planned" }); setModal({ type: "operation" }); }} onEdit={(row) => { setForm({ ...row, assignedNGO: row.assignedNGO?._id || "", reliefCamp: row.reliefCamp?._id || "" }); setModal({ type: "operation", row }); }} onDelete={(row) => submit(() => API.delete(`/admin/operations/${row._id}`), "Operation deleted.")} />}
          {view === "ngos" && <PeopleView title="NGOs" rows={filtered(data.ngos, ["fullName", "email", "phone", "approvalStatus"])} onEdit={(row) => { setForm({ isActive: row.isActive, approvalStatus: row.approvalStatus }); setModal({ type: "user", row }); }} />}
          {view === "volunteers" && <PeopleView title="Volunteers" rows={filtered(data.volunteers, ["fullName", "email", "phone", "approvalStatus"])} onEdit={(row) => { setForm({ isActive: row.isActive, approvalStatus: row.approvalStatus }); setModal({ type: "user", row }); }} />}
          {view === "users" && <UsersView rows={filtered(data.users, ["fullName", "email", "role", "phone", "approvalStatus"])} onEdit={(row) => { setForm({ role: row.role, isActive: row.isActive, approvalStatus: row.approvalStatus }); setModal({ type: "user", row }); }} />}
          {view === "donations" && <DonationsView donations={filtered(data.donations, ["referenceId", "donationType", "status"])} ngoContributions={ngoContributions} onEdit={(row) => { setForm({ status: row.status }); setModal({ type: "donation", row }); }} />}
          {view === "distribution" && <DistributionView rows={filtered(distributions, ["itemType", "location", "recipient", "status"])} onCreate={() => { setForm({ itemType: "Food", quantity: 1, unit: "units", location: "", recipient: "", status: "Planned", notes: "" }); setModal({ type: "distribution" }); }} onEdit={(row) => { setForm({ ...row, camp: row.camp?._id || "", operation: row.operation?._id || "" }); setModal({ type: "distribution", row }); }} />}
          {view === "approvals" && <ApprovalsView rows={approvals} onAction={(row, status) => submit(() => API.put(`/admin/approvals/${row._id}`, { status }), `User ${status.toLowerCase()}.`)} />}
          {view === "reports" && <ReportsView report={reports} />}
          {view === "announcements" && <AnnouncementsView rows={announcements} onCreate={() => { setForm({ title: "", message: "", audience: "All", priority: "Normal", status: "Published" }); setModal({ type: "announcement" }); }} onEdit={(row) => { setForm(row); setModal({ type: "announcement", row }); }} onDelete={(row) => submit(() => API.delete(`/admin/announcements/${row._id}`), "Announcement deleted.")} />}
          {view === "logs" && <LogsView rows={logs} search={search} />}
          {view === "settings" && <SettingsView rows={settings} onSave={(row) => submit(() => API.put("/admin/settings", { key: row.key, value: row.value, description: row.description }), "Setting saved.")} />}
        </div>
      </main>

      {modal && <AdminModal modal={modal} form={form} setForm={setForm} close={closeModal} submit={submit} data={data} />}
    </div>
  );
}

function Dashboard({ stats, cards, critical, highAssistance, limitedCamps, occupancy, totalCapacity, occupied, donationTotal, data, go, fmt }) {
  const activity = [...data.emergencies.map((x) => ({ type: "Emergency", title: x.emergencyType, location: x.location, status: x.status, date: x.createdAt })), ...data.assistance.map((x) => ({ type: "Assistance", title: x.assistanceType, location: x.location, status: x.status, date: x.createdAt })), ...data.operations.map((x) => ({ type: "Operation", title: x.title, location: x.location, status: x.status, date: x.createdAt }))].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 7);
  return <>
    <section className="admin-hero"><div><span>CONTROL & MONITORING AUTHORITY</span><h2>Hello, Admin.</h2><p>Monitor the complete disaster-relief ecosystem, identify priority cases, and coordinate platform-wide operations from one central authority.</p></div><div className="hero-badge"><FaShieldAlt /><strong>SYSTEM ADMINISTRATION</strong><small>Platform-wide oversight</small></div></section>
    <section className="stat-grid">{cards.map(([label, value, Icon, tone]) => <div className="stat-card" key={label}><div className={`stat-icon ${tone}`}><Icon /></div><div><span>{label}</span><strong>{value}</strong></div></div>)}</section>
    <section className="two-col">
      <div className="panel"><div className="panel-head"><div><span>REQUIRES ATTENTION</span><h3>Command Overview</h3></div><FaShieldAlt /></div><div className="attention-list"><Attention icon={FaExclamationTriangle} tone="red" title={`${critical.length} Critical Emergencies`} text="Immediate cases requiring command-level attention." onClick={() => go("emergencies")} /><Attention icon={FaHandsHelping} tone="amber" title={`${highAssistance.length} High-Priority Assistance`} text="Citizen assistance requests requiring action." onClick={() => go("assistance")} /><Attention icon={FaCampground} tone="blue" title={`${limitedCamps.length} Camp Capacity Warnings`} text="Relief camps with limited or full capacity." onClick={() => go("camps")} /><Attention icon={FaClipboardCheck} tone="purple" title={`${stats.pendingApprovals || 0} Pending Approvals`} text="Accounts waiting for administrative review." onClick={() => go("approvals")} /></div></div>
      <div className="panel"><div className="panel-head"><div><span>RELIEF INFRASTRUCTURE</span><h3>Camp Capacity</h3></div><FaCampground /></div><div className="capacity-big">{occupancy}% <small>overall occupancy</small></div><div className="progress"><i style={{ width: `${Math.min(100, occupancy)}%` }} /></div><div className="mini-grid"><div><span>Total Capacity</span><strong>{totalCapacity}</strong></div><div><span>Occupied</span><strong>{occupied}</strong></div><div><span>Available</span><strong>{Math.max(0, totalCapacity - occupied)}</strong></div></div></div>
    </section>
    <section className="two-col"><div className="panel"><div className="panel-head"><div><span>SYSTEM ACTIVITY</span><h3>Recent Activity</h3></div><FaClock /></div><div className="activity-list">{activity.length ? activity.map((x, i) => <div className="activity-row" key={i}><div className="activity-dot"><FaFileAlt /></div><div><strong>{x.title || x.type}</strong><span>{x.type} · {x.location || "—"}</span><small>{fmt(x.date)} · {x.status}</small></div></div>) : <Empty />}</div></div><div className="panel"><div className="panel-head"><div><span>PLATFORM OVERVIEW</span><h3>Operational Network</h3></div><FaChartLine /></div><div className="network-grid"><div><span>NGOs</span><strong>{data.ngos.length}</strong></div><div><span>Volunteers</span><strong>{data.volunteers.length}</strong></div><div><span>Relief Camps</span><strong>{data.camps.length}</strong></div><div><span>Donation Records</span><strong>{data.donations.length}</strong></div><div><span>Active Operations</span><strong>{data.operations.filter((x) => active(x.status)).length}</strong></div><div><span>Active Help Requests</span><strong>{data.assistance.filter((x) => active(x.status)).length}</strong></div></div><div className="total-donation">Total Donations Recorded <strong>{money(donationTotal)}</strong></div></div></section>
  </>;
}

function Attention({ icon: Icon, tone, title, text, onClick }) { return <button className="attention" onClick={onClick}><div className={`attention-icon ${tone}`}><Icon /></div><div><strong>{title}</strong><span>{text}</span></div><FaChevronRight /></button>; }

function CommandCenter({ priorityCases, stats, go }) { return <><section className="admin-hero command-hero"><div><span>CONTROL & MONITORING AUTHORITY</span><h2>Admin Command Center</h2><p>Review critical cases and system-wide response status from one central administrative command view.</p></div><div className="hero-badge"><FaShieldAlt /><strong>ADMIN COMMAND CENTER</strong><small>System-wide oversight</small></div></section><section className="stat-grid">{stats.slice(0, 4).map(([label, value, Icon, tone]) => <div className="stat-card" key={label}><div className={`stat-icon ${tone}`}><Icon /></div><div><span>{label}</span><strong>{value}</strong></div></div>)}</section><section className="two-col"><div className="panel"><div className="panel-head"><div><span>REQUIRES ADMINISTRATIVE ATTENTION</span><h3>Priority Response Queue</h3></div><FaShieldAlt /></div>{priorityCases.length ? <div className="priority-list">{priorityCases.map((x) => <button className="priority-row" key={`${x.type}-${x.id}`} onClick={() => go(x.target)}><div className={`priority-icon ${x.tone}`}><x.icon /></div><div><strong>{x.title}</strong><span>{x.type} · {x.location}</span><small>{x.status}</small></div><b>{x.priority}</b><FaChevronRight /></button>)}</div> : <Empty text="No priority cases require immediate attention." />}</div><div className="panel"><div className="panel-head"><div><span>SYSTEM-WIDE MONITORING</span><h3>Response Status</h3></div><FaPeopleArrows /></div><div className="response-list">{stats.slice(0, 4).map(([label, value, Icon, tone]) => <div key={label}><div className={`stat-icon ${tone}`}><Icon /></div><span>{label}</span><strong>{value}</strong><FaCheckCircle /></div>)}</div><div className="status-note"><FaShieldAlt /><div><strong>Administrative Oversight Active</strong><span>Admin is monitoring platform-wide disaster response activity.</span></div></div></div></section><section className="panel quick-panel"><div className="panel-head"><div><span>ADMINISTRATIVE CONTROL</span><h3>Quick Access</h3></div><FaArrowRight /></div><div className="quick-grid">{[["emergencies","Emergency Management",FaExclamationTriangle],["assistance","Assistance Requests",FaHandsHelping],["camps","Relief Camps",FaCampground],["operations","Operations",FaPeopleArrows]].map(([id,label,Icon]) => <button key={id} onClick={() => go(id)}><Icon /><span><strong>{label}</strong><small>Open management module</small></span><FaChevronRight /></button>)}</div></section></>; }

function RequestTable({ type, rows, onEdit }) { const isEmergency = type === "emergencies"; return <section className="panel full-panel"><Toolbar count={rows.length} /><div className="table-wrap"><table><thead><tr><th>Request</th><th>Citizen</th><th>Location</th><th>Priority</th><th>Status</th><th>Created</th><th /></tr></thead><tbody>{rows.map((x) => <tr key={x._id}><td><strong>{isEmergency ? x.emergencyType : x.assistanceType}</strong><small>{isEmergency ? x.severity : x.priority}</small></td><td>{x.user?.fullName || x.user?.email || "Citizen"}</td><td>{x.location}</td><td><span className={`badge ${String(isEmergency ? x.severity : x.priority).toLowerCase()}`}>{isEmergency ? x.severity : x.priority}</span></td><td><span className="status-badge">{x.status}</span></td><td>{fmt(x.createdAt)}</td><td><button className="icon-btn" onClick={() => onEdit(x)}><FaEdit /></button></td></tr>)}{!rows.length && <tr><td colSpan="7"><Empty /></td></tr>}</tbody></table></div></section>; }
function Toolbar({ count, action, label = "" }) { return <div className="module-toolbar"><div><span>ADMINISTRATIVE MODULE</span><h2>{count} record{count === 1 ? "" : "s"}</h2></div>{action && <button className="primary-btn" onClick={action}><FaPlus /> {label}</button>}</div>; }
function CampsView({ rows, onCreate, onEdit, onDelete }) { return <section className="panel full-panel"><Toolbar count={rows.length} action={onCreate} label="Create Camp" /><div className="table-wrap"><table><thead><tr><th>Camp</th><th>Location</th><th>Capacity</th><th>Occupancy</th><th>Status</th><th /></tr></thead><tbody>{rows.map((x) => <tr key={x._id}><td><strong>{x.name}</strong><small>{x.contactNumber || "No contact"}</small></td><td>{x.location}</td><td>{x.capacity}</td><td>{x.occupied}</td><td><span className="status-badge">{x.status}</span></td><td><button className="icon-btn" onClick={() => onEdit(x)}><FaEdit /></button><button className="icon-btn danger" onClick={() => onDelete(x)}><FaTrash /></button></td></tr>)}{!rows.length && <tr><td colSpan="6"><Empty /></td></tr>}</tbody></table></div></section>; }
function OperationsView({ rows, onCreate, onEdit, onDelete }) { return <section className="panel full-panel"><Toolbar count={rows.length} action={onCreate} label="Create Operation" /><div className="table-wrap"><table><thead><tr><th>Operation</th><th>Type</th><th>Location</th><th>People</th><th>Status</th><th /></tr></thead><tbody>{rows.map((x) => <tr key={x._id}><td><strong>{x.title}</strong><small>{fmt(x.createdAt)}</small></td><td>{x.operationType}</td><td>{x.location || "—"}</td><td>{x.affectedPeople || 0}</td><td><span className="status-badge">{x.status}</span></td><td><button className="icon-btn" onClick={() => onEdit(x)}><FaEdit /></button><button className="icon-btn danger" onClick={() => onDelete(x)}><FaTrash /></button></td></tr>)}{!rows.length && <tr><td colSpan="6"><Empty /></td></tr>}</tbody></table></div></section>; }
function PeopleView({ title, rows, onEdit }) { return <section className="panel full-panel"><Toolbar count={rows.length} /><div className="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Approval</th><th>Account</th><th /></tr></thead><tbody>{rows.map((x) => <tr key={x._id}><td><strong>{x.fullName}</strong></td><td>{x.email}</td><td>{x.phone}</td><td><span className="status-badge">{x.approvalStatus || "Approved"}</span></td><td>{x.isActive === false ? <span className="badge critical">Inactive</span> : <span className="badge low">Active</span>}</td><td><button className="icon-btn" onClick={() => onEdit(x)}><FaEdit /></button></td></tr>)}{!rows.length && <tr><td colSpan="6"><Empty text={`No ${title.toLowerCase()} found.`} /></td></tr>}</tbody></table></div></section>; }
function UsersView({ rows, onEdit }) { return <section className="panel full-panel"><Toolbar count={rows.length} /><div className="table-wrap"><table><thead><tr><th>User</th><th>Email</th><th>Role</th><th>Approval</th><th>Account</th><th>Joined</th><th /></tr></thead><tbody>{rows.map((x) => <tr key={x._id}><td><strong>{x.fullName}</strong><small>{x.phone}</small></td><td>{x.email}</td><td>{x.role}</td><td>{x.approvalStatus || "Approved"}</td><td>{x.isActive === false ? "Inactive" : "Active"}</td><td>{fmt(x.createdAt)}</td><td><button className="icon-btn" onClick={() => onEdit(x)}><FaEdit /></button></td></tr>)}{!rows.length && <tr><td colSpan="7"><Empty /></td></tr>}</tbody></table></div></section>; }
function DonationsView({ donations, ngoContributions, onEdit }) { return <section className="panel full-panel"><Toolbar count={donations.length + ngoContributions.length} /><div className="table-wrap"><table><thead><tr><th>Reference</th><th>Donor / NGO</th><th>Type</th><th>Amount</th><th>Status</th><th>Date</th><th /></tr></thead><tbody>{[...donations.map((x) => ({ ...x, source: "Donation" })), ...ngoContributions.map((x) => ({ ...x, referenceId: x.referenceId, donor: x.ngo, donationType: x.itemType || x.contributionType, amount: x.amount, source: "NGO Contribution" }))].map((x) => <tr key={`${x.source}-${x._id}`}><td><strong>{x.referenceId}</strong><small>{x.source}</small></td><td>{x.donor?.fullName || "—"}</td><td>{x.donationType || x.contributionType}</td><td>{money(x.amount)}</td><td><span className="status-badge">{x.status}</span></td><td>{fmt(x.createdAt)}</td><td>{x.source === "Donation" && <button className="icon-btn" onClick={() => onEdit(x)}><FaEdit /></button>}</td></tr>)}{!donations.length && !ngoContributions.length && <tr><td colSpan="7"><Empty /></td></tr>}</tbody></table></div></section>; }
function DistributionView({ rows, onCreate, onEdit }) { return <section className="panel full-panel"><Toolbar count={rows.length} action={onCreate} label="Record Distribution" /><div className="table-wrap"><table><thead><tr><th>Item</th><th>Quantity</th><th>Location</th><th>Recipient</th><th>Status</th><th>Date</th><th /></tr></thead><tbody>{rows.map((x) => <tr key={x._id}><td><strong>{x.itemType}</strong><small>{x.unit}</small></td><td>{x.quantity}</td><td>{x.location || "—"}</td><td>{x.recipient || "—"}</td><td><span className="status-badge">{x.status}</span></td><td>{fmt(x.createdAt)}</td><td><button className="icon-btn" onClick={() => onEdit(x)}><FaEdit /></button></td></tr>)}{!rows.length && <tr><td colSpan="7"><Empty text="No distribution records yet." /></td></tr>}</tbody></table></div></section>; }
function ApprovalsView({ rows, onAction }) { return <section className="panel full-panel"><Toolbar count={rows.length} /><div className="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Submitted</th><th>Actions</th></tr></thead><tbody>{rows.map((x) => <tr key={x._id}><td><strong>{x.fullName}</strong></td><td>{x.email}</td><td>{x.role}</td><td>{fmt(x.createdAt)}</td><td><button className="small-btn success" onClick={() => onAction(x, "Approved")}><FaCheck /> Approve</button><button className="small-btn danger" onClick={() => onAction(x, "Rejected")}><FaTimes /> Reject</button></td></tr>)}{!rows.length && <tr><td colSpan="5"><Empty text="No pending approvals." /></td></tr>}</tbody></table></div></section>; }
function ReportsView({ report }) { if (!report) return <section className="panel full-panel"><Empty text="Loading report..." /></section>; const blocks = [["Emergencies", report.emergencies], ["Assistance", report.assistance], ["Operations", report.operations], ["Donations", report.donations], ["Distribution", report.distributions], ["Users", report.users], ["Camps", report.camps]]; return <div className="report-grid">{blocks.map(([title, rows]) => <section className="panel report-card" key={title}><div className="panel-head"><div><span>ANALYTICS</span><h3>{title}</h3></div><FaChartLine /></div>{rows?.length ? rows.map((x) => <div className="bar-row" key={String(x._id)}><span>{x._id || "Unknown"}</span><b>{x.count}</b><i><em style={{ width: `${Math.min(100, x.count * 12)}%` }} /></i></div>) : <Empty text="No data available." />}</section>)}</div>; }
function AnnouncementsView({ rows, onCreate, onEdit, onDelete }) { return <section className="panel full-panel"><Toolbar count={rows.length} action={onCreate} label="New Announcement" /><div className="announcement-grid">{rows.map((x) => <article key={x._id}><div className="announcement-top"><span>{x.priority}</span><small>{x.status}</small></div><h3>{x.title}</h3><p>{x.message}</p><footer><span>{x.audience} · {fmt(x.createdAt)}</span><div><button className="icon-btn" onClick={() => onEdit(x)}><FaEdit /></button><button className="icon-btn danger" onClick={() => onDelete(x)}><FaTrash /></button></div></footer></article>)}{!rows.length && <Empty text="No announcements have been created." />}</div></section>; }
function LogsView({ rows }) { return <section className="panel full-panel"><Toolbar count={rows.length} /><div className="table-wrap"><table><thead><tr><th>Time</th><th>Action</th><th>Module</th><th>Description</th><th>Performed By</th></tr></thead><tbody>{rows.map((x) => <tr key={x._id}><td>{fmt(x.createdAt)}</td><td><strong>{x.action}</strong></td><td>{x.module}</td><td>{x.description}</td><td>{x.performedBy?.fullName || "System"}</td></tr>)}{!rows.length && <tr><td colSpan="5"><Empty text="No activity logs recorded yet." /></td></tr>}</tbody></table></div></section>; }
function SettingsView({ rows, onSave }) { const defaults = [{ key: "platformName", value: "ReliefConnect", description: "Platform display name" }, { key: "emergencyResponseEnabled", value: true, description: "Allow emergency response operations" }, { key: "maintenanceMode", value: false, description: "Temporarily restrict public operations" }]; const merged = rows.length ? rows : defaults; return <section className="panel full-panel"><Toolbar count={merged.length} /><div className="settings-list">{merged.map((row) => <SettingRow key={row.key} row={row} onSave={onSave} />)}</div></section>; }
function SettingRow({ row, onSave }) { const [value, setValue] = useState(row.value); return <div className="setting-row"><div><strong>{row.key}</strong><span>{row.description || "System setting"}</span></div>{typeof row.value === "boolean" ? <label className="switch"><input type="checkbox" checked={Boolean(value)} onChange={(e) => setValue(e.target.checked)} /><i /></label> : <input value={value ?? ""} onChange={(e) => setValue(e.target.value)} />}{<button className="small-btn" onClick={() => onSave({ ...row, value })}><FaSave /> Save</button>}</div>; }
function MapView({ data }) { const center = [20.5937, 78.9629]; return <section className="panel full-panel map-panel"><div className="panel-head"><div><span>LIVE GEOGRAPHICAL OVERVIEW</span><h3>Disaster Response Map</h3></div><FaMapMarkedAlt /></div><p className="module-note">Only records with latitude and longitude are shown on the map.</p><MapContainer center={center} zoom={5} scrollWheelZoom className="admin-map"><TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />{data.emergencies.map((x) => <CircleMarker key={`e-${x._id}`} center={[x.latitude, x.longitude]} radius={9} pathOptions={{ color: "#dc2626", fillColor: "#ef4444", fillOpacity: .75 }}><Popup><strong>Emergency: {x.emergencyType}</strong><br />{x.location}<br />Status: {x.status}</Popup></CircleMarker>)}{data.assistance.map((x) => <CircleMarker key={`a-${x._id}`} center={[x.latitude, x.longitude]} radius={8} pathOptions={{ color: "#d97706", fillColor: "#f59e0b", fillOpacity: .75 }}><Popup><strong>Assistance: {x.assistanceType}</strong><br />{x.location}<br />Status: {x.status}</Popup></CircleMarker>)}{data.camps.map((x) => <CircleMarker key={`c-${x._id}`} center={[x.latitude, x.longitude]} radius={8} pathOptions={{ color: "#2563eb", fillColor: "#3b82f6", fillOpacity: .75 }}><Popup><strong>Relief Camp: {x.name}</strong><br />{x.location}<br />{x.occupied}/{x.capacity} occupied</Popup></CircleMarker>)}</MapContainer></section>; }
function Empty({ text = "No records available." }) { return <div className="empty"><FaCheckCircle /><strong>{text}</strong></div>; }

function AdminModal({ modal, form, setForm, close, submit, data }) {
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const save = () => {
    if (modal.type === "emergency") return submit(() => API.put(`/admin/emergencies/${modal.row._id}`, form), "Emergency updated.");
    if (modal.type === "assistance") return submit(() => API.put(`/admin/assistance/${modal.row._id}`, form), "Assistance request updated.");
    if (modal.type === "camp") { const payload = { ...form, facilities: String(form.facilities || "").split(",").map((x) => x.trim()).filter(Boolean), capacity: Number(form.capacity), occupied: Number(form.occupied) }; return submit(() => modal.row ? API.put(`/admin/camps/${modal.row._id}`, payload) : API.post("/admin/camps", payload), "Relief camp saved."); }
    if (modal.type === "operation") return submit(() => modal.row ? API.put(`/admin/operations/${modal.row._id}`, form) : API.post("/admin/operations", form), "Operation saved.");
    if (modal.type === "user") return submit(() => API.put(`/admin/users/${modal.row._id}`, form), "User updated.");
    if (modal.type === "donation") return submit(() => API.put(`/admin/donations/${modal.row._id}`, form), "Donation updated.");
    if (modal.type === "distribution") return submit(() => modal.row ? API.put(`/admin/distribution/${modal.row._id}`, form) : API.post("/admin/distribution", form), "Distribution saved.");
    if (modal.type === "announcement") return submit(() => modal.row ? API.put(`/admin/announcements/${modal.row._id}`, form) : API.post("/admin/announcements", form), "Announcement saved.");
    return null;
  };
  const title = { emergency: "Update Emergency", assistance: "Update Assistance Request", camp: modal.row ? "Edit Relief Camp" : "Create Relief Camp", operation: modal.row ? "Edit Operation" : "Create Operation", user: "Manage User", donation: "Update Donation", distribution: modal.row ? "Edit Distribution" : "Record Distribution", announcement: modal.row ? "Edit Announcement" : "New Announcement" }[modal.type];
  return <div className="modal-backdrop"><div className="admin-modal"><div className="modal-head"><div><span>ADMINISTRATION</span><h2>{title}</h2></div><button onClick={close}><FaTimes /></button></div>
    {modal.type === "emergency" && <><Field label="Status"><select value={form.status || "Pending"} onChange={(e) => set("status", e.target.value)}>{["Pending","Acknowledged","In Progress","Resolved","Rejected"].map((x) => <option key={x}>{x}</option>)}</select></Field><Field label="Severity"><select value={form.severity || "Medium"} onChange={(e) => set("severity", e.target.value)}>{["Low","Medium","High","Critical"].map((x) => <option key={x}>{x}</option>)}</select></Field><Field label="Assigned Volunteer"><select value={form.assignedVolunteer || ""} onChange={(e) => set("assignedVolunteer", e.target.value)}><option value="">Not assigned</option>{data.volunteers.map((x) => <option key={x._id} value={x._id}>{x.fullName}</option>)}</select></Field></>}
    {modal.type === "assistance" && <><Field label="Status"><select value={form.status || "Pending"} onChange={(e) => set("status", e.target.value)}>{["Pending","Acknowledged","In Progress","Fulfilled","Rejected"].map((x) => <option key={x}>{x}</option>)}</select></Field><Field label="Priority"><select value={form.priority || "Medium"} onChange={(e) => set("priority", e.target.value)}>{["Low","Medium","High","Critical"].map((x) => <option key={x}>{x}</option>)}</select></Field><Field label="Assigned Volunteer"><select value={form.assignedVolunteer || ""} onChange={(e) => set("assignedVolunteer", e.target.value)}><option value="">Not assigned</option>{data.volunteers.map((x) => <option key={x._id} value={x._id}>{x.fullName}</option>)}</select></Field></>}
    {modal.type === "camp" && <><Field label="Camp Name"><input value={form.name || ""} onChange={(e) => set("name", e.target.value)} /></Field><Field label="Location"><input value={form.location || ""} onChange={(e) => set("location", e.target.value)} /></Field><div className="form-grid"><Field label="Capacity"><input type="number" value={form.capacity ?? 0} onChange={(e) => set("capacity", e.target.value)} /></Field><Field label="Occupied"><input type="number" value={form.occupied ?? 0} onChange={(e) => set("occupied", e.target.value)} /></Field></div><div className="form-grid"><Field label="Latitude"><input value={form.latitude ?? ""} onChange={(e) => set("latitude", e.target.value)} /></Field><Field label="Longitude"><input value={form.longitude ?? ""} onChange={(e) => set("longitude", e.target.value)} /></Field></div><Field label="Contact Number"><input value={form.contactNumber || ""} onChange={(e) => set("contactNumber", e.target.value)} /></Field><Field label="Facilities (comma separated)"><input value={form.facilities || ""} onChange={(e) => set("facilities", e.target.value)} /></Field><Field label="Status"><select value={form.status || "Open"} onChange={(e) => set("status", e.target.value)}>{["Open","Limited Capacity","Full","Closed"].map((x) => <option key={x}>{x}</option>)}</select></Field><Field label="Description"><textarea value={form.description || ""} onChange={(e) => set("description", e.target.value)} /></Field></>}
    {modal.type === "operation" && <><Field label="Title"><input value={form.title || ""} onChange={(e) => set("title", e.target.value)} /></Field><Field label="Operation Type"><select value={form.operationType || "Direct Assistance"} onChange={(e) => set("operationType", e.target.value)}>{["Direct Assistance","Resource Deployment","Relief Distribution","Camp Allocation","NGO Coordination","Volunteer Deployment","Emergency Escalation"].map((x) => <option key={x}>{x}</option>)}</select></Field><div className="form-grid"><Field label="Location"><input value={form.location || ""} onChange={(e) => set("location", e.target.value)} /></Field><Field label="Affected People"><input type="number" value={form.affectedPeople ?? 0} onChange={(e) => set("affectedPeople", e.target.value)} /></Field></div><Field label="Status"><select value={form.status || "Planned"} onChange={(e) => set("status", e.target.value)}>{["Planned","In Progress","Completed","Cancelled"].map((x) => <option key={x}>{x}</option>)}</select></Field><Field label="Assigned NGO"><select value={form.assignedNGO || ""} onChange={(e) => set("assignedNGO", e.target.value)}><option value="">Not assigned</option>{data.ngos.map((x) => <option key={x._id} value={x._id}>{x.fullName}</option>)}</select></Field><Field label="Relief Camp"><select value={form.reliefCamp || ""} onChange={(e) => set("reliefCamp", e.target.value)}><option value="">Not assigned</option>{data.camps.map((x) => <option key={x._id} value={x._id}>{x.name}</option>)}</select></Field><Field label="Description"><textarea value={form.description || ""} onChange={(e) => set("description", e.target.value)} /></Field></>}
    {modal.type === "user" && <><Field label="Role"><select value={form.role || modal.row.role} onChange={(e) => set("role", e.target.value)}>{["Citizen","Volunteer","Donor","NGO","Government","Admin"].map((x) => <option key={x}>{x}</option>)}</select></Field><Field label="Approval Status"><select value={form.approvalStatus || "Approved"} onChange={(e) => set("approvalStatus", e.target.value)}>{["Pending","Approved","Rejected"].map((x) => <option key={x}>{x}</option>)}</select></Field><label className="check-row"><input type="checkbox" checked={form.isActive !== false} onChange={(e) => set("isActive", e.target.checked)} /> Account active</label></>}
    {modal.type === "donation" && <Field label="Status"><select value={form.status || "Recorded"} onChange={(e) => set("status", e.target.value)}>{["Recorded","Verified","Used"].map((x) => <option key={x}>{x}</option>)}</select></Field>}
    {modal.type === "distribution" && <><Field label="Item Type"><input value={form.itemType || ""} onChange={(e) => set("itemType", e.target.value)} /></Field><div className="form-grid"><Field label="Quantity"><input type="number" value={form.quantity ?? 0} onChange={(e) => set("quantity", e.target.value)} /></Field><Field label="Unit"><input value={form.unit || "units"} onChange={(e) => set("unit", e.target.value)} /></Field></div><div className="form-grid"><Field label="Location"><input value={form.location || ""} onChange={(e) => set("location", e.target.value)} /></Field><Field label="Recipient"><input value={form.recipient || ""} onChange={(e) => set("recipient", e.target.value)} /></Field></div><Field label="Status"><select value={form.status || "Planned"} onChange={(e) => set("status", e.target.value)}>{["Planned","In Progress","Distributed","Cancelled"].map((x) => <option key={x}>{x}</option>)}</select></Field><Field label="Notes"><textarea value={form.notes || ""} onChange={(e) => set("notes", e.target.value)} /></Field></>}
    {modal.type === "announcement" && <><Field label="Title"><input value={form.title || ""} onChange={(e) => set("title", e.target.value)} /></Field><Field label="Message"><textarea value={form.message || ""} onChange={(e) => set("message", e.target.value)} /></Field><div className="form-grid"><Field label="Audience"><select value={form.audience || "All"} onChange={(e) => set("audience", e.target.value)}>{["All","Citizen","Volunteer","Donor","NGO","Government"].map((x) => <option key={x}>{x}</option>)}</select></Field><Field label="Priority"><select value={form.priority || "Normal"} onChange={(e) => set("priority", e.target.value)}>{["Normal","Important","Critical"].map((x) => <option key={x}>{x}</option>)}</select></Field></div><Field label="Status"><select value={form.status || "Published"} onChange={(e) => set("status", e.target.value)}>{["Draft","Published","Archived"].map((x) => <option key={x}>{x}</option>)}</select></Field></>}
    <div className="modal-actions"><button className="secondary-btn" onClick={close}>Cancel</button><button className="primary-btn" onClick={save}><FaSave /> Save Changes</button></div>
  </div></div>;
}
function Field({ label, children }) { return <label className="field"><span>{label}</span>{children}</label>; }

export default Admin;
