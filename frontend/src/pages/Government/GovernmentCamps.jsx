import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  useMapEvents,
} from "react-leaflet";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSyncAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";
import API from "../../services/api";
import "./GovernmentManagement.css";

const blank = {
  name: "",
  location: "",
  contactNumber: "",
  capacity: 0,
  occupied: 0,
  facilities: "",
  status: "",
  latitude: "",
  longitude: "",
  description: "",
};

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
        window.alert(
          "Unable to get your current location. Please select the camp location directly on the map."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="gm-camp-location-picker">
      <div className="gm-camp-location-picker-head">
        <div>
          <strong>Select Camp Location on Map</strong>
          <span>
            Click on the map where the Government relief camp is located, or use your current location.
          </span>
        </div>
        <button type="button" className="gm-map-location-btn" onClick={useCurrentLocation}>
          <FaMapMarkerAlt /> Use My Location
        </button>
      </div>

      <div className="gm-camp-picker-map">
        <MapContainer
          key={`${center[0]}-${center[1]}`}
          center={center}
          zoom={hasLocation ? 15 : 11}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationEvents />
          {hasLocation && (
            <CircleMarker
              center={[lat, lng]}
              radius={10}
              pathOptions={{
                color: "#2563eb",
                fillColor: "#3b82f6",
                fillOpacity: 0.8,
              }}
            />
          )}
        </MapContainer>
      </div>

      <div className="gm-camp-coordinates">
        <span>
          Latitude: <strong>{hasLocation ? lat.toFixed(6) : "Not selected"}</strong>
        </span>
        <span>
          Longitude: <strong>{hasLocation ? lng.toFixed(6) : "Not selected"}</strong>
        </span>
      </div>
    </div>
  );
}

function GovernmentCamps({ onBack }) {
  const [camps, setCamps] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const response = await API.get("/government/camps");
      setCamps(response.data?.camps || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load relief camps.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(blank);
    setShow(true);
    setMessage("");
    setError("");
  };

  const openEdit = (camp) => {
    setEditing(camp._id);
    setForm({
      ...camp,
      facilities: Array.isArray(camp.facilities)
        ? camp.facilities.join(", ")
        : camp.facilities || "",
      latitude: camp.latitude ?? "",
      longitude: camp.longitude ?? "",
    });
    setShow(true);
    setError("");
  };

  const setCampLocation = (latitude, longitude) => {
    setForm((current) => ({
      ...current,
      latitude: String(latitude),
      longitude: String(longitude),
    }));
  };

  const save = async (event) => {
    event.preventDefault();

    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);

    if (
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90 ||
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      setError("Please select the relief camp location on the map before saving.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        ...form,
        capacity: Number(form.capacity),
        occupied: Number(form.occupied),
        facilities: String(form.facilities || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        status: form.status || undefined,
        latitude,
        longitude,
      };

      if (editing) {
        await API.put(`/government/camps/${editing}`, payload);
        setMessage("Camp updated successfully.");
      } else {
        await API.post("/government/camps", payload);
        setMessage("Government relief camp created successfully.");
      }

      setShow(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save camp.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this government-owned camp?")) return;

    try {
      await API.delete(`/government/camps/${id}`);
      setMessage("Camp deleted successfully.");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete camp.");
    }
  };

  return (
    <div className="gm-page">
      <div className="gm-toolbar">
        <div className="gm-toolbar-left">
          <button className="gm-btn primary" onClick={openCreate}>
            <FaPlus /> Create Government Camp
          </button>
          <button className="gm-btn secondary" onClick={load}>
            <FaSyncAlt /> Refresh
          </button>
        </div>
        <button className="gm-btn secondary" onClick={onBack}>
          Back to Dashboard
        </button>
      </div>

      {message && <div className="government-alert success">{message}</div>}
      {error && <div className="government-alert error">{error}</div>}

      <section className="gm-panel">
        <div className="gm-section-heading">
          <div>
            <h2>Relief Camp Management</h2>
            <p>View all camps and manage camps owned by the Government.</p>
          </div>
        </div>

        {loading ? (
          <div className="gm-empty">Loading camps...</div>
        ) : camps.length === 0 ? (
          <div className="gm-empty">No relief camps found.</div>
        ) : (
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Camp</th>
                  <th>Location</th>
                  <th>Capacity</th>
                  <th>Occupied</th>
                  <th>Status</th>
                  <th>Managed By</th>
                  <th>Contact</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {camps.map((camp) => (
                  <tr key={camp._id}>
                    <td><strong>{camp.name}</strong></td>
                    <td>{camp.location}</td>
                    <td>{camp.capacity}</td>
                    <td>{camp.occupied}</td>
                    <td>
                      <span
                        className={`gm-pill ${
                          camp.status === "Open"
                            ? "green"
                            : camp.status === "Full"
                              ? "red"
                              : "orange"
                        }`}
                      >
                        {camp.status}
                      </span>
                    </td>
                    <td>
                      {camp.managedByGovernment?.fullName
                        ? `Government — ${camp.managedByGovernment.fullName}`
                        : camp.managedByNGO?.fullName
                          ? `NGO — ${camp.managedByNGO.fullName}`
                          : "System"}
                    </td>
                    <td>{camp.contactNumber || "—"}</td>
                    <td>
                      {camp.managedByGovernment && (
                        <div className="gm-actions">
                          <button className="gm-btn secondary" onClick={() => openEdit(camp)}>
                            <FaEdit />
                          </button>
                          <button className="gm-btn danger" onClick={() => remove(camp._id)}>
                            <FaTrash />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {show && (
        <div className="gm-modal-backdrop">
          <div className="gm-modal gm-camp-modal-location">
            <div className="gm-modal-header">
              <h3>{editing ? "Edit Government Camp" : "Create Government Camp"}</h3>
              <button className="gm-close" onClick={() => setShow(false)}>
                <FaTimes />
              </button>
            </div>

            <form className="gm-form-grid" onSubmit={save}>
              <div className="gm-form-field">
                <label>Camp Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>

              <div className="gm-form-field">
                <label>Contact Number</label>
                <input value={form.contactNumber || ""} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} />
              </div>

              <div className="gm-form-field full">
                <label>Location</label>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
              </div>

              <div className="gm-form-field">
                <label>Capacity</label>
                <input type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} required />
              </div>

              <div className="gm-form-field">
                <label>Occupied</label>
                <input type="number" min="0" value={form.occupied} onChange={(e) => setForm({ ...form, occupied: e.target.value })} />
              </div>

              <div className="gm-form-field">
                <label>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="">Auto</option>
                  <option>Open</option>
                  <option>Limited Capacity</option>
                  <option>Full</option>
                  <option>Closed</option>
                </select>
              </div>

              <div className="gm-form-field full">
                <label>Facilities (comma separated)</label>
                <input value={form.facilities || ""} onChange={(e) => setForm({ ...form, facilities: e.target.value })} placeholder="Food, Medical, Water, Toilets" />
              </div>

              <div className="gm-form-field full">
                <label>Description</label>
                <textarea rows="4" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="gm-form-field full">
                <CampLocationPicker
                  latitude={form.latitude}
                  longitude={form.longitude}
                  onChange={setCampLocation}
                />
              </div>

              <div className="gm-form-actions">
                <button type="button" className="gm-btn secondary" onClick={() => setShow(false)}>
                  Cancel
                </button>
                <button className="gm-btn primary" disabled={saving}>
                  {saving ? "Saving..." : editing ? "Update Camp" : "Create Camp"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GovernmentCamps;
