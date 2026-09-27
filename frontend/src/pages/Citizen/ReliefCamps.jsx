import { useEffect, useMemo, useState } from "react";
import API from "../../services/api";

import {
  FaArrowLeft,
  FaCampground,
  FaMapMarkerAlt,
  FaPhone,
  FaUsers,
  FaSearch,
  FaCheckCircle,
  FaExclamationCircle,
  FaTimesCircle,
  FaHospital,
  FaTint,
  FaUtensils,
  FaHome,
  FaBoxOpen,
} from "react-icons/fa";

import "./ReliefCamps.css";

function ReliefCamps({ onBack }) {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // =========================================================
  // FETCH RELIEF CAMPS
  // =========================================================

  useEffect(() => {
    const fetchReliefCamps = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get("/relief-camps");

        setCamps(response.data.camps || []);
      } catch (error) {
        console.error(
          "Failed to fetch relief camps:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Failed to load relief camps."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReliefCamps();
  }, []);

  // =========================================================
  // FILTER CAMPS
  // =========================================================

  const filteredCamps = useMemo(() => {
    return camps.filter((camp) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !search ||
        camp.name?.toLowerCase().includes(search) ||
        camp.location?.toLowerCase().includes(search) ||
        camp.description?.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "All" ||
        camp.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [camps, searchTerm, statusFilter]);

  // =========================================================
  // STATUS CLASS
  // =========================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "Open":
        return "camp-status-open";

      case "Limited Capacity":
        return "camp-status-limited";

      case "Full":
        return "camp-status-full";

      case "Closed":
        return "camp-status-closed";

      default:
        return "camp-status-open";
    }
  };

  // =========================================================
  // STATUS ICON
  // =========================================================

  const getStatusIcon = (status) => {
    switch (status) {
      case "Open":
        return <FaCheckCircle />;

      case "Limited Capacity":
        return <FaExclamationCircle />;

      case "Full":
        return <FaTimesCircle />;

      case "Closed":
        return <FaTimesCircle />;

      default:
        return <FaCheckCircle />;
    }
  };

  // =========================================================
  // FACILITY ICON
  // =========================================================

  const getFacilityIcon = (facility) => {
    const value = facility?.toLowerCase() || "";

    if (
      value.includes("medical") ||
      value.includes("health") ||
      value.includes("doctor")
    ) {
      return <FaHospital />;
    }

    if (
      value.includes("water") ||
      value.includes("drinking")
    ) {
      return <FaTint />;
    }

    if (
      value.includes("food") ||
      value.includes("meal")
    ) {
      return <FaUtensils />;
    }

    if (
      value.includes("shelter") ||
      value.includes("bed")
    ) {
      return <FaHome />;
    }

    return <FaBoxOpen />;
  };

  // =========================================================
  // AVAILABLE CAPACITY
  // =========================================================

  const getAvailableCapacity = (camp) => {
    const capacity = Number(camp.capacity || 0);
    const occupied = Number(camp.occupied || 0);

    return Math.max(capacity - occupied, 0);
  };

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="relief-camps-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="relief-camps-header">

        <button
          className="back-button"
          onClick={onBack}
        >
          <FaArrowLeft />
          Back to Dashboard
        </button>

        <div className="relief-camps-title">

          <div className="relief-camps-title-icon">
            <FaCampground />
          </div>

          <div>
            <p>EMERGENCY SHELTER SERVICES</p>

            <h1>Relief Camps</h1>

            <span>
              Find nearby relief camps and emergency
              shelters available during disasters.
            </span>
          </div>

        </div>

      </header>


      {/* =====================================================
          SEARCH + FILTER
      ===================================================== */}

      <section className="relief-camps-controls">

        <div className="camp-search">

          <FaSearch />

          <input
            type="text"
            placeholder="Search by camp name or location..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />

        </div>


        <div className="camp-filters">

          {[
            "All",
            "Open",
            "Limited Capacity",
            "Full",
            "Closed",
          ].map((status) => (
            <button
              key={status}
              className={
                statusFilter === status
                  ? "camp-filter active"
                  : "camp-filter"
              }
              onClick={() =>
                setStatusFilter(status)
              }
            >
              {status}
            </button>
          ))}

        </div>

      </section>


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <main className="relief-camps-content">

        {/* LOADING */}

        {loading && (
          <div className="camp-message">

            <FaCampground />

            <h2>Loading relief camps...</h2>

            <p>
              Please wait while we retrieve available
              relief camps.
            </p>

          </div>
        )}


        {/* ERROR */}

        {!loading && error && (
          <div className="camp-message error">

            <FaExclamationCircle />

            <h2>Unable to load relief camps</h2>

            <p>{error}</p>

            <button
              onClick={() =>
                window.location.reload()
              }
            >
              Try Again
            </button>

          </div>
        )}


        {/* EMPTY */}

        {!loading &&
          !error &&
          filteredCamps.length === 0 && (
            <div className="camp-message">

              <FaCampground />

              <h2>No relief camps found</h2>

              <p>
                {camps.length === 0
                  ? "No relief camps have been added yet."
                  : "Try changing your search or filter."}
              </p>

            </div>
          )}


        {/* CAMP LIST */}

        {!loading &&
          !error &&
          filteredCamps.length > 0 && (
            <div className="relief-camps-grid">

              {filteredCamps.map((camp) => {

                const available =
                  getAvailableCapacity(camp);

                return (
                  <article
                    className="relief-camp-card"
                    key={camp._id}
                  >

                    {/* CARD HEADER */}

                    <div className="camp-card-header">

                      <div className="camp-icon">
                        <FaCampground />
                      </div>

                      <span
                        className={`camp-status ${getStatusClass(
                          camp.status
                        )}`}
                      >
                        {getStatusIcon(camp.status)}

                        {camp.status}
                      </span>

                    </div>


                    {/* CAMP NAME */}

                    <div className="camp-card-main">

                      <h2>{camp.name}</h2>

                      <div className="camp-location">
                        <FaMapMarkerAlt />

                        <span>
                          {camp.location}
                        </span>
                      </div>

                      {camp.description && (
                        <p className="camp-description">
                          {camp.description}
                        </p>
                      )}

                    </div>


                    {/* CAPACITY */}

                    <div className="camp-capacity">

                      <div className="capacity-header">

                        <span>
                          <FaUsers />
                          Capacity
                        </span>

                        <strong>
                          {available} available
                        </strong>

                      </div>

                      <div className="capacity-bar">

                        <div
                          className="capacity-fill"
                          style={{
                            width: `${
                              camp.capacity > 0
                                ? Math.min(
                                    (camp.occupied /
                                      camp.capacity) *
                                      100,
                                    100
                                  )
                                : 0
                            }%`,
                          }}
                        />

                      </div>

                      <div className="capacity-numbers">

                        <span>
                          Occupied:{" "}
                          {camp.occupied || 0}
                        </span>

                        <span>
                          Total:{" "}
                          {camp.capacity || 0}
                        </span>

                      </div>

                    </div>


                    {/* FACILITIES */}

                    {camp.facilities?.length > 0 && (
                      <div className="camp-facilities">

                        <h3>Available Facilities</h3>

                        <div className="facility-list">

                          {camp.facilities.map(
                            (facility, index) => (
                              <span
                                className="facility-tag"
                                key={`${facility}-${index}`}
                              >
                                {getFacilityIcon(
                                  facility
                                )}

                                {facility}
                              </span>
                            )
                          )}

                        </div>

                      </div>
                    )}


                    {/* CONTACT */}

                    {camp.contactNumber && (
                      <div className="camp-contact">

                        <FaPhone />

                        <span>
                          {camp.contactNumber}
                        </span>

                      </div>
                    )}

                  </article>
                );
              })}

            </div>
          )}

      </main>

    </div>
  );
}

export default ReliefCamps;