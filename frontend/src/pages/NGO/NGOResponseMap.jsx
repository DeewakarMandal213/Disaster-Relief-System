import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Tooltip,
} from "react-leaflet";
import {
  FaArrowLeft,
  FaSyncAlt,
  FaDirections,
  FaMapMarkerAlt,
  FaCampground,
  FaExclamationTriangle,
  FaHandsHelping,
  FaUsers,
} from "react-icons/fa";
import API from "../../services/api";

import "leaflet/dist/leaflet.css";

function NGOResponseMap({ onBack }) {
  const [data, setData] = useState({
    emergencies: [],
    assistance: [],
    camps: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMapData = async () => {
    try {
      setLoading(true);
      setError("");

      const [emergencyResponse, assistanceResponse, campResponse] =
        await Promise.all([
          API.get("/emergencies"),
          API.get("/assistance"),
          API.get("/relief-camps"),
        ]);

      setData({
        emergencies: emergencyResponse.data?.emergencies || [],
        assistance: assistanceResponse.data?.assistances || [],
        camps: campResponse.data?.camps || [],
      });
    } catch (err) {
      console.error("NGO response map error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load response map data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMapData();
  }, []);

  const points = useMemo(() => {
    const result = [];

    data.emergencies.forEach((item) => {
      if (
        Number.isFinite(Number(item.latitude)) &&
        Number.isFinite(Number(item.longitude))
      ) {
        result.push({
          type: "Emergency",
          id: item._id,
          title: item.emergencyType || "Emergency",
          location: item.location,
          lat: Number(item.latitude),
          lng: Number(item.longitude),
          status: item.status,
          priority: item.severity,
          description: item.description,
          color:
            item.severity === "Critical"
              ? "#dc2626"
              : item.severity === "High"
                ? "#f97316"
                : "#2563eb",
        });
      }
    });

    data.assistance.forEach((item) => {
      if (
        Number.isFinite(Number(item.latitude)) &&
        Number.isFinite(Number(item.longitude))
      ) {
        result.push({
          type: "Assistance",
          id: item._id,
          title: item.assistanceType || "Assistance",
          location: item.location,
          lat: Number(item.latitude),
          lng: Number(item.longitude),
          status: item.status,
          priority: item.priority,
          description: item.description,
          color:
            item.priority === "Critical"
              ? "#dc2626"
              : item.priority === "High"
                ? "#f97316"
                : "#16a34a",
        });
      }
    });

    data.camps.forEach((camp) => {
      if (
        Number.isFinite(Number(camp.latitude)) &&
        Number.isFinite(Number(camp.longitude))
      ) {
        result.push({
          type: "Relief Camp",
          id: camp._id,
          title: camp.name,
          location: camp.location,
          lat: Number(camp.latitude),
          lng: Number(camp.longitude),
          status: camp.status,
          description: camp.description,
          color: "#7c3aed",
          isCamp: true,
        });
      }
    });

    return result;
  }, [data]);

  const unmappedRequests = useMemo(
    () =>
      [...data.emergencies, ...data.assistance].filter(
        (item) =>
          !Number.isFinite(Number(item.latitude)) ||
          !Number.isFinite(Number(item.longitude))
      ),
    [data]
  );

  const unmappedCamps = useMemo(
    () =>
      data.camps.filter(
        (camp) =>
          !Number.isFinite(Number(camp.latitude)) ||
          !Number.isFinite(Number(camp.longitude))
      ),
    [data.camps]
  );

  const center = points.length
    ? [points[0].lat, points[0].lng]
    : [13.0827, 80.2707];

  return (
    <div className="ngo-response-map-page">
      <div className="ngo-map-toolbar">
        <div className="ngo-map-toolbar-left">
          <button
            type="button"
            className="ngo-map-toolbar-btn"
            onClick={loadMapData}
            disabled={loading}
          >
            <FaSyncAlt /> Refresh Map
          </button>
          <span className="ngo-map-count-pill">
            {points.length} mapped locations
          </span>
        </div>

        <button
          type="button"
          className="ngo-map-toolbar-btn"
          onClick={onBack}
        >
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>

      {error && <div className="ngo-map-error">{error}</div>}

      <div className="ngo-map-heading">
        <span>DISASTER RESPONSE & LOCATION SERVICES</span>
        <h1>Response Map</h1>
        <p>
          View citizen emergency requests and relief camps on one map,
          with stored coordinates and directions for response teams.
        </p>
      </div>

      {loading ? (
        <div className="ngo-map-empty">Loading response map...</div>
      ) : (
        <div className="ngo-response-map-layout">
          <div className="ngo-response-map-container">
            <MapContainer
              center={center}
              zoom={12}
              scrollWheelZoom
              style={{ width: "100%", height: "100%" }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {points.map((point) => (
                <CircleMarker
                  key={`${point.type}-${point.id}`}
                  center={[point.lat, point.lng]}
                  radius={point.isCamp ? 11 : 9}
                  pathOptions={{
                    color: point.color,
                    fillColor: point.color,
                    fillOpacity: 0.82,
                    weight: 2,
                  }}
                >
                  <Tooltip>{point.title}</Tooltip>
                  <Popup>
                    <strong>{point.type}</strong>
                    <br />
                    {point.title}
                    <br />
                    {point.location || "Location not provided"}
                    <br />
                    Status: {point.status || "—"}
                    {point.priority && <><br />Priority: {point.priority}</>}
                    {point.description && <><br />{point.description}</>}
                    <br />
                    <a
                      className="ngo-map-directions"
                      target="_blank"
                      rel="noreferrer"
                      href={`https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}`}
                    >
                      <FaDirections /> Get Directions
                    </a>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>

          <aside className="ngo-response-map-panel">
            <div className="ngo-map-panel-header">
              <div>
                <span>RESPONSE LOCATIONS</span>
                <h2>Citizens & Camps</h2>
              </div>
              <FaMapMarkerAlt />
            </div>

            <div className="ngo-map-stat-grid">
              <div>
                <FaExclamationTriangle />
                <strong>{data.emergencies.length}</strong>
                <span>Emergencies</span>
              </div>
              <div>
                <FaHandsHelping />
                <strong>{data.assistance.length}</strong>
                <span>Assistance</span>
              </div>
              <div>
                <FaCampground />
                <strong>{data.camps.length}</strong>
                <span>Relief Camps</span>
              </div>
            </div>

            <div className="ngo-map-location-list">
              <div className="ngo-map-list-heading">
                <strong>Relief Camps</strong>
                <span>{data.camps.length}</span>
              </div>

              {data.camps.map((camp) => {
                const available = Math.max(
                  Number(camp.capacity || 0) - Number(camp.occupied || 0),
                  0
                );
                const mapped = points.some(
                  (point) => point.type === "Relief Camp" && point.id === camp._id
                );

                return (
                  <div className="ngo-map-camp-item" key={camp._id}>
                    <div className="ngo-map-camp-icon">
                      <FaCampground />
                    </div>
                    <div>
                      <strong>{camp.name}</strong>
                      <span>{camp.location}</span>
                      <small>
                        {available} available · {camp.status || "Status unavailable"}
                      </small>
                      {!mapped && <em>Map coordinates not available yet</em>}
                    </div>
                  </div>
                );
              })}

              {!data.camps.length && (
                <div className="ngo-map-no-items">No relief camps available.</div>
              )}
            </div>

            {unmappedRequests.length > 0 && (
              <div className="ngo-map-note">
                <FaUsers />
                <span>
                  {unmappedRequests.length} citizen request(s) have no stored
                  coordinates yet and cannot be placed precisely on the map.
                </span>
              </div>
            )}

            {unmappedCamps.length > 0 && (
              <div className="ngo-map-note camp-note">
                <FaCampground />
                <span>
                  {unmappedCamps.length} camp(s) are listed but do not yet have
                  latitude/longitude, so they are visible in the list instead of
                  as map markers.
                </span>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

export default NGOResponseMap;
