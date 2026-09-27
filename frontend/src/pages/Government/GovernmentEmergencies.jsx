import { useEffect, useMemo, useState } from "react";
import { FaArrowLeft, FaCheckCircle, FaExclamationTriangle, FaUserCheck } from "react-icons/fa";
import { toast } from "react-toastify";
import API from "../../services/api";
import "./GovernmentRequests.css";

const statusClass = (status = "") => status.toLowerCase().replace(/\s+/g, "-");

function GovernmentEmergencies({ onBack }) {
  const [items, setItems] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("All");
  const [status, setStatus] = useState("All");
  const [selected, setSelected] = useState(null);
  const [assignType, setAssignType] = useState("");
  const [assignValue, setAssignValue] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [emergencyRes, ngoRes, volunteerRes] = await Promise.all([
        API.get("/government/emergencies"),
        API.get("/government/ngos"),
        API.get("/government/volunteers"),
      ]);
      setItems(emergencyRes.data.emergencies || []);
      setNgos(ngoRes.data.ngos || []);
      setVolunteers(volunteerRes.data.volunteers || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load government emergency data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filtered = useMemo(() => items.filter((item) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || [
      item.emergencyType,
      item.location,
      item.description,
      item.user?.fullName,
      item.user?.phone,
    ].some((value) => String(value || "").toLowerCase().includes(q));
    return matchesSearch && (severity === "All" || item.severity === severity) && (status === "All" || item.status === status);
  }), [items, search, severity, status]);

  const takeAction = async (id) => {
    try {
      setBusyId(id);
      await API.put(`/government/emergency/${id}/take-action`);
      toast.success("Government response started.");
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to start government response.");
    } finally { setBusyId(""); }
  };

  const assign = async () => {
    if (!selected || !assignType || !assignValue) return toast.warning("Select an assignment first.");
    try {
      setBusyId(selected._id);
      const url = assignType === "NGO"
        ? `/government/emergency/${selected._id}/assign-ngo`
        : `/government/emergency/${selected._id}/assign-volunteer`;
      await API.put(url, assignType === "NGO" ? { ngoId: assignValue } : { volunteerId: assignValue });
      toast.success(`${assignType} assigned successfully.`);
      setSelected(null); setAssignType(""); setAssignValue("");
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || `Unable to assign ${assignType.toLowerCase()}.`);
    } finally { setBusyId(""); }
  };

  return (
    <div className="gov-page">
      <div className="gov-page-header">
        <button className="gov-back-btn" onClick={onBack}><FaArrowLeft /> Dashboard</button>
        <div>
          <h1>Emergency Monitoring</h1>
          <p>Monitor every emergency request and coordinate the response.</p>
        </div>
        <button className="gov-refresh-btn" onClick={loadData}>Refresh</button>
      </div>

      <div className="gov-alert-strip">
        <FaExclamationTriangle /> Critical emergencies should be reviewed first. Government can coordinate an NGO, deploy a volunteer, or take direct responsibility.
      </div>

      <div className="gov-filters">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search person, location, type..." />
        <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
          <option>All</option><option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>All</option><option>Pending</option><option>Acknowledged</option><option>In Progress</option><option>Resolved</option><option>Rejected</option>
        </select>
        <span className="gov-result-count">{filtered.length} of {items.length} requests</span>
      </div>

      {loading ? <div className="gov-empty">Loading emergencies...</div> : filtered.length === 0 ? <div className="gov-empty">No emergency requests match the selected filters.</div> : (
        <div className="gov-table-card">
          <div className="table-responsive">
            <table className="gov-table">
              <thead><tr><th>Priority</th><th>Citizen</th><th>Emergency</th><th>Location</th><th>Assigned</th><th>Status</th><th>Reported</th><th>Action</th></tr></thead>
              <tbody>{filtered.map((item) => (
                <tr key={item._id}>
                  <td><span className={`gov-pill severity-${statusClass(item.severity)}`}>{item.severity}</span></td>
                  <td><strong>{item.user?.fullName || "Unknown"}</strong><small>{item.user?.phone || ""}</small></td>
                  <td>{item.emergencyType}</td>
                  <td>{item.location || "Location not provided"}</td>
                  <td><div className="assignment-cell">{item.handledByNGO?.fullName ? `NGO: ${item.handledByNGO.fullName}` : item.assignedVolunteer?.fullName ? `Volunteer: ${item.assignedVolunteer.fullName}` : item.handledByGovernment?.fullName ? `Government: ${item.handledByGovernment.fullName}` : "Unassigned"}</div></td>
                  <td><span className={`gov-pill status-${statusClass(item.status)}`}>{item.status}</span></td>
                  <td>{item.createdAt ? new Date(item.createdAt).toLocaleString() : "—"}</td>
                  <td><div className="gov-actions">
                    <button className="btn-outline" onClick={() => setSelected(item)}>Details</button>
                    {!['Resolved','Rejected'].includes(item.status) && <button className="btn-primary" disabled={busyId === item._id} onClick={() => takeAction(item._id)}>{busyId === item._id ? "Working..." : "Take Action"}</button>}
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {selected && <div className="gov-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setSelected(null)}><div className="gov-modal">
        <div className="gov-modal-head"><div><span className={`gov-pill severity-${statusClass(selected.severity)}`}>{selected.severity}</span><h2>{selected.emergencyType}</h2></div><button onClick={() => setSelected(null)}>×</button></div>
        <div className="gov-detail-grid"><div><b>Citizen</b><span>{selected.user?.fullName || "Unknown"}</span></div><div><b>Contact</b><span>{selected.user?.phone || "—"}</span></div><div><b>Location</b><span>{selected.location || "—"}</span></div><div><b>Status</b><span>{selected.status}</span></div><div className="wide"><b>Description</b><span>{selected.description || "No description provided."}</span></div></div>
        <div className="gov-assign-box"><h3><FaUserCheck /> Coordinate Response</h3><div className="assign-row"><select value={assignType} onChange={(e) => { setAssignType(e.target.value); setAssignValue(""); }}><option value="">Choose type</option><option value="NGO">NGO</option><option value="Volunteer">Volunteer</option></select><select value={assignValue} disabled={!assignType} onChange={(e) => setAssignValue(e.target.value)}><option value="">Choose {assignType || "resource"}</option>{assignType === "NGO" ? ngos.map((n) => <option key={n._id} value={n._id}>{n.fullName} — {n.activeRequests || 0} active</option>) : volunteers.map((v) => <option key={v._id} value={v._id}>{v.fullName} — {v.available ? "Available" : `${v.activeAssignments} active`}</option>)}</select><button className="btn-primary" onClick={assign} disabled={!assignType || !assignValue || busyId === selected._id}>Assign</button></div></div>
        {!['Resolved','Rejected'].includes(selected.status) && <button className="btn-government-action" onClick={() => { takeAction(selected._id); setSelected(null); }}><FaCheckCircle /> Government takes responsibility</button>}
      </div></div>}
    </div>
  );
}
export default GovernmentEmergencies;
