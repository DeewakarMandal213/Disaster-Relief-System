import { useEffect, useMemo, useState } from "react";
import {
  FaCheckCircle,
  FaChevronDown,
  FaClock,
  FaExclamationTriangle,
  FaFilter,
  FaMapMarkerAlt,
  FaPhone,
  FaSearch,
  FaShieldAlt,
  FaSyncAlt,
  FaUser,
  FaUsers,
} from "react-icons/fa";
import API from "../../services/api";
import "./AdminEmergencyManagement.css";

const STATUS_OPTIONS = ["Pending", "Acknowledged", "In Progress", "Resolved", "Rejected"];
const CLOSED_STATUSES = ["Resolved", "Rejected"];

const statusClass = (status) => String(status || "Pending").toLowerCase().replace(/\s+/g, "-");
const priorityClass = (severity) => String(severity || "Medium").toLowerCase();

const formatDate = (value) => {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function AdminEmergencyManagement({ onDataChanged }) {
  const [emergencies, setEmergencies] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [updatingId, setUpdatingId] = useState("");

  const loadData = async (silent = false) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError("");

      const [emergencyResult, ngoResult, volunteerResult] = await Promise.all([
        API.get("/admin/emergencies"),
        API.get("/admin/ngos"),
        API.get("/admin/volunteers"),
      ]);

      setEmergencies(emergencyResult.data?.emergencies || []);
      setNgos(ngoResult.data?.ngos || []);
      setVolunteers(volunteerResult.data?.volunteers || []);
    } catch (err) {
      console.error("Admin emergency management error:", err);
      setError(err.response?.data?.message || "Unable to load emergency management data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const counts = useMemo(() => ({
    total: emergencies.length,
    pending: emergencies.filter((item) => item.status === "Pending").length,
    acknowledged: emergencies.filter((item) => item.status === "Acknowledged").length,
    inProgress: emergencies.filter((item) => item.status === "In Progress").length,
    resolved: emergencies.filter((item) => item.status === "Resolved").length,
    critical: emergencies.filter((item) => item.severity === "Critical" && !CLOSED_STATUSES.includes(item.status)).length,
  }), [emergencies]);

  const filteredEmergencies = useMemo(() => {
    const term = search.trim().toLowerCase();
    return emergencies.filter((item) => {
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      const matchesSeverity = severityFilter === "All" || item.severity === severityFilter;
      const matchesSearch = !term || [
        item.emergencyType,
        item.severity,
        item.status,
        item.location,
        item.description,
        item.user?.fullName,
        item.user?.email,
        item.user?.phone,
        item.handledByNGO?.fullName,
        item.assignedVolunteer?.fullName,
      ].some((value) => String(value || "").toLowerCase().includes(term));
      return matchesStatus && matchesSeverity && matchesSearch;
    });
  }, [emergencies, search, statusFilter, severityFilter]);

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      setError("");
      setNotice("");
      await API.put(`/admin/emergencies/${id}/status`, { status });
      setNotice(`Emergency status updated to ${status}.`);
      await loadData(true);
      onDataChanged?.();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update emergency status.");
    } finally {
      setUpdatingId("");
    }
  };

  const updateAssignment = async (id, field, value) => {
    try {
      setUpdatingId(id);
      setError("");
      setNotice("");
      await API.put(`/admin/emergencies/${id}/assignment`, { [field]: value || null });
      setNotice(`${field === "ngoId" ? "NGO" : "Volunteer"} assignment updated.`);
      await loadData(true);
      onDataChanged?.();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update assignment.");
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <div className="admin-emergency-page">
      <section className="admin-emergency-hero">
        <div>
          <span>ADMINISTRATIVE CONTROL / OPERATIONS</span>
          <h2>Emergency Management</h2>
          <p>
            Monitor every emergency request in the system, review citizen details,
            coordinate NGO and volunteer assignments, and control the request lifecycle.
          </p>
        </div>
        <div className="admin-emergency-authority">
          <FaShieldAlt />
          <strong>ADMIN CONTROL</strong>
          <span>System-wide emergency oversight</span>
        </div>
      </section>

      <section className="admin-emergency-stats">
        <div><span>Total Requests</span><strong>{counts.total}</strong><small>All emergency reports</small></div>
        <div><span>Pending</span><strong>{counts.pending}</strong><small>Awaiting administrative action</small></div>
        <div><span>Acknowledged</span><strong>{counts.acknowledged}</strong><small>Accepted for response</small></div>
        <div><span>In Progress</span><strong>{counts.inProgress}</strong><small>Currently being handled</small></div>
        <div><span>Resolved</span><strong>{counts.resolved}</strong><small>Completed emergency cases</small></div>
        <div className="critical"><span>Critical Active</span><strong>{counts.critical}</strong><small>Requires priority attention</small></div>
      </section>

      <section className="admin-emergency-toolbar">
        <div className="admin-emergency-search">
          <FaSearch />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search emergency, citizen, location..." />
        </div>
        <div className="admin-emergency-filter">
          <FaFilter />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
        <div className="admin-emergency-filter">
          <FaExclamationTriangle />
          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
            <option value="All">All Severity</option>
            {['Low', 'Medium', 'High', 'Critical'].map((severity) => <option key={severity} value={severity}>{severity}</option>)}
          </select>
        </div>
        <button className="admin-emergency-refresh" onClick={() => loadData(true)} disabled={refreshing}>
          <FaSyncAlt className={refreshing ? "spin" : ""} /> Refresh
        </button>
      </section>

      {error && <div className="admin-emergency-message error"><FaExclamationTriangle /><span>{error}</span></div>}
      {notice && <div className="admin-emergency-message success"><FaCheckCircle /><span>{notice}</span></div>}

      <section className="admin-emergency-list-panel">
        <div className="admin-emergency-list-heading">
          <div><span>LIVE REQUEST REGISTER</span><h3>Emergency Requests</h3></div>
          <strong>{filteredEmergencies.length} shown</strong>
        </div>

        {loading ? (
          <div className="admin-emergency-empty"><FaSyncAlt className="spin" /><strong>Loading emergency requests...</strong></div>
        ) : filteredEmergencies.length === 0 ? (
          <div className="admin-emergency-empty"><FaCheckCircle /><strong>No emergency requests match the current filters.</strong><span>Try changing the status, severity or search filter.</span></div>
        ) : (
          <div className="admin-emergency-table-wrap">
            <table className="admin-emergency-table">
              <thead>
                <tr>
                  <th>Emergency</th>
                  <th>Citizen</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Coordination</th>
                  <th>Administrative Control</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmergencies.map((item) => {
                  const busy = updatingId === item._id;
                  return (
                    <tr key={item._id}>
                      <td>
                        <div className="emergency-title-cell">
                          <div className={`emergency-severity-icon ${priorityClass(item.severity)}`}><FaExclamationTriangle /></div>
                          <div>
                            <strong>{item.emergencyType || "Emergency"}</strong>
                            <span className={`emergency-severity ${priorityClass(item.severity)}`}>{item.severity || "Medium"}</span>
                            <small><FaClock /> {formatDate(item.createdAt)}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="emergency-citizen-cell">
                          <strong><FaUser /> {item.user?.fullName || "Citizen"}</strong>
                          <span>{item.user?.email || "No email"}</span>
                          {item.user?.phone && <small><FaPhone /> {item.user.phone}</small>}
                        </div>
                      </td>
                      <td>
                        <div className="emergency-location-cell">
                          <span><FaMapMarkerAlt /> {item.location || "Location unavailable"}</span>
                          {item.latitude != null && item.longitude != null && <small>{Number(item.latitude).toFixed(5)}, {Number(item.longitude).toFixed(5)}</small>}
                        </div>
                      </td>
                      <td>
                        <span className={`emergency-status-badge ${statusClass(item.status)}`}>{item.status || "Pending"}</span>
                      </td>
                      <td>
                        <div className="emergency-assignment-cell">
                          <label>NGO</label>
                          <select disabled={busy || CLOSED_STATUSES.includes(item.status)} value={item.handledByNGO?._id || ""} onChange={(e) => updateAssignment(item._id, "ngoId", e.target.value)}>
                            <option value="">Not assigned</option>
                            {ngos.map((ngo) => <option key={ngo._id} value={ngo._id}>{ngo.fullName}</option>)}
                          </select>
                          <label>Volunteer</label>
                          <select disabled={busy || CLOSED_STATUSES.includes(item.status)} value={item.assignedVolunteer?._id || ""} onChange={(e) => updateAssignment(item._id, "volunteerId", e.target.value)}>
                            <option value="">Not assigned</option>
                            {volunteers.map((volunteer) => <option key={volunteer._id} value={volunteer._id}>{volunteer.fullName}</option>)}
                          </select>
                        </div>
                      </td>
                      <td>
                        <div className="emergency-control-cell">
                          <select disabled={busy} value={item.status || "Pending"} onChange={(e) => updateStatus(item._id, e.target.value)}>
                            {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
                          </select>
                          {busy && <small><FaSyncAlt className="spin" /> Updating...</small>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-emergency-footer-note">
        <FaShieldAlt />
        <div>
          <strong>Administrative authority is active</strong>
          <span>Resolved and rejected cases remain in the register for accountability, while active cases continue to appear in Command Center monitoring.</span>
        </div>
        <div className="admin-emergency-footer-network"><FaUsers /> {ngos.length} NGOs · {volunteers.length} Volunteers</div>
      </section>
    </div>
  );
}

export default AdminEmergencyManagement;
