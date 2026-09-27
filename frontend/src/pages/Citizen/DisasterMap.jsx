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
  FaCampground,
  FaMapMarkerAlt,
  FaUsers,
  FaPhone,
  FaCheckCircle,
  FaExclamationCircle,
  FaTimesCircle,
  FaFire,
  FaTint,
  FaBuilding,
  FaExclamationTriangle,
  FaHandsHelping,
  FaUtensils,
  FaMedkit,
  FaHome,
  FaBoxOpen,
  FaSyncAlt,
} from "react-icons/fa";

import API from "../../services/api";
import "leaflet/dist/leaflet.css";
import "./DisasterMap.css";

const DEFAULT_CENTER = [13.0827, 80.2707];

function DisasterMap({ onBack }) {
  const [camps, setCamps] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [assistances, setAssistances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMapData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        campResponse,
        emergencyResponse,
        assistanceResponse,
      ] = await Promise.all([
        API.get("/relief-camps"),
        API.get("/emergencies"),
        API.get("/assistance"),
      ]);

      setCamps(campResponse.data?.camps || []);
      setEmergencies(emergencyResponse.data?.emergencies || []);
      setAssistances(assistanceResponse.data?.assistances || []);
    } catch (err) {
      console.error("Failed to load disaster map data:", err);
      setError(
        err.response?.data?.message || "Failed to load map data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMapData();
  }, []);

  const hasCoordinates = (item) =>
    Number.isFinite(Number(item?.latitude)) &&
    Number.isFinite(Number(item?.longitude));

  /*
   * IMPORTANT:
   * Resolved requests are intentionally removed ONLY from
   * the Disaster Map response data.
   *
   * This does NOT delete them from the database and does NOT
   * change the Citizen Dashboard's total request count.
   */
  const isActiveRequest = (item) =>
    String(item?.status || "").trim().toLowerCase() !== "resolved";

  /*
   * Active Emergencies only
   */
  const activeEmergencies = useMemo(
    () => emergencies.filter(isActiveRequest),
    [emergencies]
  );

  /*
   * Active Assistance Requests only
   */
  const activeAssistances = useMemo(
    () => assistances.filter(isActiveRequest),
    [assistances]
  );

  /*
   * Only active requests with valid coordinates
   * are placed on the map.
   */
  const mappedCamps = useMemo(
    () => camps.filter(hasCoordinates),
    [camps]
  );

  const mappedEmergencies = useMemo(
    () =>
      activeEmergencies.filter(hasCoordinates),
    [activeEmergencies]
  );

  const mappedAssistances = useMemo(
    () =>
      activeAssistances.filter(hasCoordinates),
    [activeAssistances]
  );

  /*
   * Combine all locations that should appear on the map.
   */
  const mappedLocations = useMemo(() => {
    const points = [];

    /*
     * RELIEF CAMPS
     */
    mappedCamps.forEach((camp) => {
      points.push({
        type: "Relief Camp",
        id: camp._id,
        title: camp.name,
        location: camp.location,
        lat: Number(camp.latitude),
        lng: Number(camp.longitude),
        status: camp.status,
        description: camp.description,
        color: "#2563eb",
        radius: 11,
      });
    });

    /*
     * ACTIVE EMERGENCIES ONLY
     */
    mappedEmergencies.forEach((emergency) => {
      points.push({
        type: "Emergency",
        id: emergency._id,
        title: emergency.emergencyType || "Emergency",
        location: emergency.location,
        lat: Number(emergency.latitude),
        lng: Number(emergency.longitude),
        status: emergency.status,
        priority: emergency.severity,
        description: emergency.description,
        contactNumber: emergency.contactNumber,
        color:
          emergency.severity === "Critical"
            ? "#dc2626"
            : emergency.severity === "High"
              ? "#f97316"
              : "#eab308",
        radius: 10,
      });
    });

    /*
     * ACTIVE ASSISTANCE REQUESTS ONLY
     */
    mappedAssistances.forEach((assistance) => {
      points.push({
        type: "Assistance",
        id: assistance._id,
        title:
          assistance.assistanceType || "Assistance Request",
        location: assistance.location,
        lat: Number(assistance.latitude),
        lng: Number(assistance.longitude),
        status: assistance.status,
        priority: assistance.priority,
        description: assistance.description,
        contactNumber: assistance.contactNumber,
        color:
          assistance.priority === "Critical"
            ? "#dc2626"
            : assistance.priority === "High"
              ? "#f97316"
              : "#16a34a",
        radius: 9,
      });
    });

    return points;
  }, [
    mappedCamps,
    mappedEmergencies,
    mappedAssistances,
  ]);

  const mapCenter = mappedLocations.length
    ? [mappedLocations[0].lat, mappedLocations[0].lng]
    : DEFAULT_CENTER;

  const getAvailableCapacity = (camp) =>
    Math.max(
      Number(camp.capacity || 0) -
        Number(camp.occupied || 0),
      0
    );

  const getStatusClass = (status) => {
    switch (status) {
      case "Open":
        return "map-status-open";

      case "Limited Capacity":
        return "map-status-limited";

      case "Full":
        return "map-status-full";

      case "Closed":
        return "map-status-closed";

      default:
        return "map-status-open";
    }
  };

  const getStatusIcon = (status) => {
    if (status === "Open") return <FaCheckCircle />;

    if (status === "Limited Capacity")
      return <FaExclamationCircle />;

    return <FaTimesCircle />;
  };

  const getEmergencyIcon = (type) => {
    if (type === "Flood") return <FaTint />;

    if (type === "Fire") return <FaFire />;

    if (type === "Building Damage")
      return <FaBuilding />;

    return <FaExclamationTriangle />;
  };

  const getAssistanceIcon = (type) => {
    if (type === "Food") return <FaUtensils />;

    if (type === "Water") return <FaTint />;

    if (type === "Medical Help") return <FaMedkit />;

    if (type === "Shelter") return <FaHome />;

    return <FaBoxOpen />;
  };

  return (
    <div className="disaster-map-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="disaster-map-header">

        <button
          className="map-back-button"
          onClick={onBack}
        >
          <FaArrowLeft />
          Back to Dashboard
        </button>

        <div className="disaster-map-title">

          <div className="disaster-map-title-icon">
            <FaMapMarkerAlt />
          </div>

          <div>
            <p>
              DISASTER RESPONSE & LOCATION SERVICES
            </p>

            <h1>Disaster Map</h1>

            <span>
              View relief camps, emergency reports and
              assistance requests on one interactive map.
            </span>
          </div>

        </div>

      </header>


      {/* =====================================================
          SUMMARY CARDS
          IMPORTANT:
          Emergencies and Assistance use ACTIVE counts only.
      ===================================================== */}

      <section className="map-summary map-summary-five">

        {/* Relief Camps */}
        <div className="map-summary-card">

          <div className="map-summary-icon blue">
            <FaCampground />
          </div>

          <div>
            <span>Relief Camps</span>
            <strong>{camps.length}</strong>
          </div>

        </div>


        {/* Open Camps */}
        <div className="map-summary-card">

          <div className="map-summary-icon green">
            <FaCheckCircle />
          </div>

          <div>
            <span>Open Camps</span>

            <strong>
              {
                camps.filter(
                  (camp) =>
                    camp.status === "Open"
                ).length
              }
            </strong>
          </div>

        </div>


        {/* Limited Capacity */}
        <div className="map-summary-card">

          <div className="map-summary-icon orange">
            <FaExclamationCircle />
          </div>

          <div>
            <span>Limited Capacity</span>

            <strong>
              {
                camps.filter(
                  (camp) =>
                    camp.status ===
                    "Limited Capacity"
                ).length
              }
            </strong>
          </div>

        </div>


        {/* ACTIVE EMERGENCIES ONLY */}
        <div className="map-summary-card">

          <div className="map-summary-icon red">
            <FaTimesCircle />
          </div>

          <div>
            <span>Emergencies</span>

            <strong>
              {activeEmergencies.length}
            </strong>
          </div>

        </div>


        {/* ACTIVE ASSISTANCE REQUESTS ONLY */}
        <div className="map-summary-card">

          <div className="map-summary-icon green">
            <FaHandsHelping />
          </div>

          <div>
            <span>Assistance Requests</span>

            <strong>
              {activeAssistances.length}
            </strong>
          </div>

        </div>

      </section>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="disaster-map-content">

        {loading && (
          <div className="map-message">

            <FaMapMarkerAlt />

            <h2>
              Loading disaster map...
            </h2>

            <p>
              Please wait while we retrieve current
              relief locations and citizen requests.
            </p>

          </div>
        )}


        {!loading && error && (
          <div className="map-message error">

            <FaExclamationCircle />

            <h2>
              Unable to load map data
            </h2>

            <p>
              {error}
            </p>

            <button onClick={loadMapData}>
              <FaSyncAlt />
              Try Again
            </button>

          </div>
        )}


        {!loading && !error && (
          <div className="map-layout">

            {/* =================================================
                MAP
            ================================================= */}

            <div className="map-container-wrapper">

              {mappedLocations.length ? (

                <MapContainer
                  center={mapCenter}
                  zoom={11}
                  scrollWheelZoom
                  className="disaster-leaflet-map"
                >

                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />


                  {mappedLocations.map((point) => (

                    <CircleMarker
                      key={`${point.type}-${point.id}`}
                      center={[
                        point.lat,
                        point.lng,
                      ]}
                      radius={point.radius}
                      pathOptions={{
                        color: point.color,
                        fillColor: point.color,
                        fillOpacity: 0.82,
                        weight: 3,
                      }}
                    >

                      <Tooltip>
                        {point.title}
                      </Tooltip>


                      <Popup>

                        <div className="map-popup">

                          <h3>
                            {point.title}
                          </h3>

                          <strong className="map-popup-type">
                            {point.type}
                          </strong>

                          <p>
                            <FaMapMarkerAlt />
                            {point.location ||
                              "Location not provided"}
                          </p>


                          {point.type ===
                          "Relief Camp" ? (

                            <>
                              <span
                                className={`map-popup-status ${getStatusClass(
                                  point.status
                                )}`}
                              >
                                {getStatusIcon(
                                  point.status
                                )}

                                {point.status ||
                                  "Open"}
                              </span>


                              <div className="popup-capacity">

                                <FaUsers />

                                <span>
                                  {
                                    getAvailableCapacity(
                                      camps.find(
                                        (c) =>
                                          c._id ===
                                          point.id
                                      ) || {}
                                    )
                                  }{" "}
                                  available
                                </span>

                              </div>
                            </>

                          ) : (

                            <>

                              {point.priority && (
                                <span className="map-popup-priority">
                                  {point.priority}
                                </span>
                              )}


                              <div className="emergency-popup-status">
                                Status:{" "}
                                <strong>
                                  {point.status ||
                                    "Pending"}
                                </strong>
                              </div>


                              {point.description && (
                                <p>
                                  <FaExclamationTriangle />
                                  {point.description}
                                </p>
                              )}


                              {point.contactNumber && (
                                <div className="popup-capacity">

                                  <FaPhone />

                                  <span>
                                    {
                                      point.contactNumber
                                    }
                                  </span>

                                </div>
                              )}

                            </>
                          )}

                        </div>

                      </Popup>

                    </CircleMarker>

                  ))}

                </MapContainer>

              ) : (

                <div className="map-no-markers">

                  <FaMapMarkerAlt />

                  <h2>
                    No mapped locations yet
                  </h2>

                  <p>
                    Camps and active requests are
                    still listed on the right. Records
                    without coordinates cannot be
                    placed precisely on the map.
                  </p>

                </div>

              )}

            </div>


            {/* =================================================
                RIGHT SIDE PANEL
            ================================================= */}

            <aside className="map-camp-panel">


              {/* =================================================
                  RELIEF CAMPS
              ================================================= */}

              <div className="map-panel-header">

                <div>

                  <p>
                    RESPONSE LOCATIONS
                  </p>

                  <h2>
                    Relief Camps
                  </h2>

                </div>

                <span>
                  {camps.length}
                </span>

              </div>


              <div className="map-camp-list">

                {camps.map((camp) => {

                  const available =
                    getAvailableCapacity(camp);

                  const mapped =
                    hasCoordinates(camp);

                  const percentage =
                    Number(camp.capacity)
                      ? Math.min(
                          100,
                          Math.round(
                            (Number(
                              camp.occupied || 0
                            ) /
                              Number(
                                camp.capacity
                              )) *
                              100
                          )
                        )
                      : 0;

                  return (
                    <div
                      key={camp._id}
                      className="map-camp-item"
                    >

                      <div className="map-camp-item-top">

                        <div className="map-camp-icon">
                          <FaCampground />
                        </div>

                        <span
                          className={`map-camp-status ${getStatusClass(
                            camp.status
                          )}`}
                        >
                          {getStatusIcon(
                            camp.status
                          )}
                        </span>

                      </div>


                      <div className="map-camp-info">

                        <h3>
                          {camp.name}
                        </h3>

                        <p>
                          <FaMapMarkerAlt />
                          {camp.location}
                        </p>

                      </div>


                      <div className="map-camp-capacity">

                        <div>

                          <span>
                            <FaUsers />
                            Capacity
                          </span>

                          <strong>
                            {available} available
                          </strong>

                        </div>

                        <div className="map-mini-bar">
                          <div
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>

                      </div>


                      {!mapped && (
                        <small className="map-unmapped-note">
                          Map coordinates not available
                        </small>
                      )}

                    </div>
                  );
                })}

              </div>


              {/* =================================================
                  ACTIVE EMERGENCIES
                  Resolved emergencies are NOT shown.
              ================================================= */}

              <div className="map-request-section">

                <div className="map-request-section-header emergency">

                  <div>

                    <p>
                      ACTIVE REPORTS
                    </p>

                    <h3>
                      Emergencies
                    </h3>

                  </div>

                  <span>
                    {activeEmergencies.length}
                  </span>

                </div>


                <div className="map-request-list">

                  {activeEmergencies.map((item) => (

                    <div
                      className="map-request-item"
                      key={`emergency-${item._id}`}
                    >

                      <div className="map-request-icon emergency">

                        <span>
                          {getEmergencyIcon(
                            item.emergencyType
                          )}
                        </span>

                      </div>


                      <div>

                        <strong>
                          {item.emergencyType}
                        </strong>

                        <span>
                          {item.location}
                        </span>

                        <small>
                          {item.severity} ·{" "}
                          {item.status}
                        </small>


                        {!hasCoordinates(item) && (
                          <small className="map-unmapped-inline">
                            No map coordinates
                          </small>
                        )}

                      </div>

                    </div>

                  ))}


                  {!activeEmergencies.length && (
                    <div className="map-empty-inline">
                      No active emergency reports.
                    </div>
                  )}

                </div>

              </div>


              {/* =================================================
                  ACTIVE ASSISTANCE REQUESTS
                  Resolved assistance requests are NOT shown.
              ================================================= */}

              <div className="map-request-section assistance">

                <div className="map-request-section-header assistance">

                  <div>

                    <p>
                      HELP REQUESTS
                    </p>

                    <h3>
                      Assistance
                    </h3>

                  </div>

                  <span>
                    {activeAssistances.length}
                  </span>

                </div>


                <div className="map-request-list">

                  {activeAssistances.map((item) => (

                    <div
                      className="map-request-item"
                      key={`assistance-${item._id}`}
                    >

                      <div className="map-request-icon assistance">

                        <span>
                          {getAssistanceIcon(
                            item.assistanceType
                          )}
                        </span>

                      </div>


                      <div>

                        <strong>
                          {item.assistanceType}
                        </strong>

                        <span>
                          {item.location}
                        </span>

                        <small>
                          {item.priority} ·{" "}
                          {item.status}
                        </small>


                        {!hasCoordinates(item) && (
                          <small className="map-unmapped-inline">
                            No map coordinates
                          </small>
                        )}

                      </div>

                    </div>

                  ))}


                  {!activeAssistances.length && (
                    <div className="map-empty-inline">
                      No active assistance requests.
                    </div>
                  )}

                </div>

              </div>

            </aside>

          </div>
        )}

      </main>

    </div>
  );
}

export default DisasterMap;