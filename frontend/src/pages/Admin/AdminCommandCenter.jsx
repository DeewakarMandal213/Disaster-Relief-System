import {
  FaArrowRight,
  FaCampground,
  FaCheckCircle,
  FaChevronRight,
  FaClock,
  FaExclamationTriangle,
  FaHandsHelping,
  FaMapMarkerAlt,
  FaPeopleArrows,
  FaShieldAlt,
} from "react-icons/fa";

import "./AdminCommandCenter.css";


function AdminCommandCenter({
  stats,
  activity,
  loading,
  setActiveView,
  formatTime,
}) {

  // =========================================================
  // SAFE DEFAULTS
  // =========================================================

  const safeStats = stats || {};

  const safeActivity = Array.isArray(activity)
    ? activity
    : [];


  // =========================================================
  // RESPONSE STATISTICS
  // =========================================================

  const responseStats = [
    {
      label: "Active Emergencies",
      value: Number(
        safeStats.activeEmergencies || 0
      ),
      icon: FaExclamationTriangle,
      tone: "red",
    },

    {
      label: "Active Assistance",
      value: Number(
        safeStats.activeAssistance || 0
      ),
      icon: FaHandsHelping,
      tone: "green",
    },

    {
      label: "Active Operations",
      value: Number(
        safeStats.activeOperations || 0
      ),
      icon: FaPeopleArrows,
      tone: "purple",
    },

    {
      label: "Relief Camps",
      value: Number(
        safeStats.reliefCamps || 0
      ),
      icon: FaCampground,
      tone: "blue",
    },
  ];


  // =========================================================
  // PRIORITY CASES
  // =========================================================
  //
  // The Admin dashboard currently provides system activity
  // through /admin/dashboard. We use that activity here
  // instead of introducing another API dependency.
  //
  // =========================================================

  const priorityCases = safeActivity
    .map((item, index) => {

      const type = String(
        item.type || "System"
      ).toLowerCase();

      let tone = "operation";

      let icon = FaPeopleArrows;

      let category = "System";

      let target = "dashboard";

      let priority =
        item.priority ||
        item.severity ||
        "Active";


      if (
        type.includes("emergency")
      ) {
        tone = "critical";
        icon = FaExclamationTriangle;
        category = "Emergency";
        target = "emergencies";
      } else if (
        type.includes("assistance")
      ) {
        tone = "warning";
        icon = FaHandsHelping;
        category = "Assistance";
        target = "assistance";
      } else if (
        type.includes("camp")
      ) {
        tone = "camp";
        icon = FaCampground;
        category = "Relief Camp";
        target = "camps";
        priority = "Capacity";
      } else if (
        type.includes("operation")
      ) {
        tone = "operation";
        icon = FaPeopleArrows;
        category = "Operation";
        target = "operations";
      }


      return {
        id:
          item._id ||
          `activity-${index}`,

        category,

        title:
          item.title ||
          `${category} Activity`,

        location:
          item.location ||
          "Location unavailable",

        status:
          item.status ||
          "Recorded",

        priority,

        date:
          item.createdAt,

        icon,

        tone,

        target,
      };

    })
    .sort(
      (a, b) =>
        new Date(b.date || 0) -
        new Date(a.date || 0)
    )
    .slice(0, 8);


  // =========================================================
  // ATTENTION SUMMARY
  // =========================================================

  const attentionSummary = [
    {
      label: "Critical Emergencies",
      value: Number(
        safeStats.criticalEmergencies || 0
      ),
      icon: FaExclamationTriangle,
      tone: "critical",
      target: "emergencies",
      description:
        "Immediate cases requiring command-level attention.",
    },

    {
      label: "Pending Assistance",
      value: Number(
        safeStats.pendingAssistance || 0
      ),
      icon: FaHandsHelping,
      tone: "warning",
      target: "assistance",
      description:
        "Citizen assistance requests awaiting action.",
    },

    {
      label: "Pending Emergencies",
      value: Number(
        safeStats.pendingEmergencies || 0
      ),
      icon: FaExclamationTriangle,
      tone: "critical",
      target: "emergencies",
      description:
        "Emergency requests still awaiting final resolution.",
    },

    {
      label: "Camp Capacity Warnings",
      value: Number(
        safeStats.limitedCamps || 0
      ),
      icon: FaCampground,
      tone: "camp",
      target: "camps",
      description:
        "Relief camps requiring capacity monitoring.",
    },
  ];


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="admin-command-page">

      {/* =====================================================
          COMMAND HEADER
      ===================================================== */}

      <section className="command-hero">

        <div>

          <span className="command-eyebrow">
            CONTROL & MONITORING AUTHORITY
          </span>

          <h2>
            Admin Command Center
          </h2>

          <p>
            Monitor priority cases, active
            response operations and critical
            relief infrastructure across the
            entire ReliefConnect platform.
          </p>

        </div>


        <div className="command-hero-badge">

          <FaShieldAlt />

          <div>

            <strong>
              ADMIN CONTROL
            </strong>

            <span>
              System-wide oversight
            </span>

          </div>

        </div>

      </section>


      {/* =====================================================
          RESPONSE SUMMARY
      ===================================================== */}

      <section className="command-stat-grid">

        {responseStats.map(
          (stat) => {

            const Icon = stat.icon;

            return (
              <div
                className={`command-stat-card ${stat.tone}`}
                key={stat.label}
              >

                <div className="command-stat-icon">
                  <Icon />
                </div>

                <div>

                  <span>
                    {stat.label}
                  </span>

                  <strong>
                    {loading
                      ? "—"
                      : stat.value}
                  </strong>

                </div>

              </div>
            );

          }
        )}

      </section>


      {/* =====================================================
          MAIN COMMAND AREA
      ===================================================== */}

      <section className="command-grid">

        {/* ===================================================
            PRIORITY QUEUE
        =================================================== */}

        <div className="command-panel priority-queue">

          <div className="command-panel-heading">

            <div>

              <span>
                REQUIRES ADMINISTRATIVE ATTENTION
              </span>

              <h3>
                Priority Response Queue
              </h3>

            </div>

            <FaShieldAlt />

          </div>


          {loading ? (

            <div className="command-empty">

              <div>
                <FaClock />
              </div>

              <strong>
                Loading Command Center
              </strong>

              <span>
                Synchronizing system-wide
                administrative data.
              </span>

            </div>

          ) : priorityCases.length > 0 ? (

            <div className="command-case-list">

              {priorityCases.map(
                (item) => {

                  const Icon =
                    item.icon;

                  return (
                    <button
                      key={item.id}
                      className="command-case"
                      onClick={() =>
                        setActiveView(
                          item.target
                        )
                      }
                    >

                      <div
                        className={`command-case-icon ${item.tone}`}
                      >
                        <Icon />
                      </div>


                      <div className="command-case-content">

                        <div className="command-case-top">

                          <strong>
                            {item.title}
                          </strong>

                          <span
                            className={`command-priority ${item.tone}`}
                          >
                            {item.priority}
                          </span>

                        </div>


                        <div className="command-case-meta">

                          <span>
                            <FaMapMarkerAlt />
                            {item.location}
                          </span>

                          <span>
                            <FaClock />
                            {formatTime(
                              item.date
                            )}
                          </span>

                        </div>


                        <small>
                          {item.category} ·{" "}
                          {item.status}
                        </small>

                      </div>


                      <FaChevronRight
                        className="command-case-arrow"
                      />

                    </button>
                  );

                }
              )}

            </div>

          ) : (

            <div className="command-empty">

              <div>
                <FaCheckCircle />
              </div>

              <strong>
                No Recent Priority Activity
              </strong>

              <span>
                There are currently no
                system activities requiring
                immediate administrative
                attention.
              </span>

            </div>

          )}

        </div>


        {/* ===================================================
            RESPONSE STATUS
        =================================================== */}

        <div className="command-panel response-status-panel">

          <div className="command-panel-heading">

            <div>

              <span>
                SYSTEM-WIDE MONITORING
              </span>

              <h3>
                Response Status
              </h3>

            </div>

            <FaPeopleArrows />

          </div>


          <div className="response-status-list">

            {responseStats.map(
              (stat) => {

                const Icon =
                  stat.icon;

                return (
                  <div
                    className="response-status-item"
                    key={stat.label}
                  >

                    <div
                      className={`response-status-icon ${stat.tone}`}
                    >
                      <Icon />
                    </div>

                    <div>

                      <span>
                        {stat.label}
                      </span>

                      <strong>
                        {loading
                          ? "—"
                          : stat.value}
                      </strong>

                    </div>

                    <FaCheckCircle />

                  </div>
                );

              }
            )}

          </div>


          <div className="command-status-note">

            <FaShieldAlt />

            <div>

              <strong>
                Administrative Oversight Active
              </strong>

              <span>
                Admin is monitoring
                platform-wide disaster
                response activity.
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          ADMIN ATTENTION
      ===================================================== */}

      <section className="command-panel command-control-panel">

        <div className="command-panel-heading">

          <div>

            <span>
              ADMINISTRATIVE CONTROL
            </span>

            <h3>
              Requires Attention
            </h3>

          </div>

          <FaArrowRight />

        </div>


        <div className="command-quick-grid">

          {attentionSummary.map(
            (item) => {

              const Icon =
                item.icon;

              return (
                <button
                  key={item.label}
                  onClick={() =>
                    setActiveView(
                      item.target
                    )
                  }
                >

                  <Icon />

                  <div>

                    <strong>
                      {item.value}{" "}
                      {item.label}
                    </strong>

                    <span>
                      {item.description}
                    </span>

                  </div>

                  <FaChevronRight />

                </button>
              );

            }
          )}

        </div>

      </section>


      {/* =====================================================
          QUICK CONTROL
      ===================================================== */}

      <section className="command-panel command-control-panel">

        <div className="command-panel-heading">

          <div>

            <span>
              ADMINISTRATIVE CONTROL
            </span>

            <h3>
              Quick Access
            </h3>

          </div>

          <FaArrowRight />

        </div>


        <div className="command-quick-grid">

          <button
            onClick={() =>
              setActiveView(
                "emergencies"
              )
            }
          >

            <FaExclamationTriangle />

            <div>

              <strong>
                Emergency Management
              </strong>

              <span>
                Review and monitor
                emergency cases
              </span>

            </div>

            <FaChevronRight />

          </button>


          <button
            onClick={() =>
              setActiveView(
                "assistance"
              )
            }
          >

            <FaHandsHelping />

            <div>

              <strong>
                Assistance Requests
              </strong>

              <span>
                Monitor citizen
                assistance requests
              </span>

            </div>

            <FaChevronRight />

          </button>


          <button
            onClick={() =>
              setActiveView(
                "camps"
              )
            }
          >

            <FaCampground />

            <div>

              <strong>
                Relief Camps
              </strong>

              <span>
                Monitor camp capacity
                and status
              </span>

            </div>

            <FaChevronRight />

          </button>


          <button
            onClick={() =>
              setActiveView(
                "operations"
              )
            }
          >

            <FaPeopleArrows />

            <div>

              <strong>
                Operations
              </strong>

              <span>
                Monitor active relief
                operations
              </span>

            </div>

            <FaChevronRight />

          </button>

        </div>

      </section>


      {/* =====================================================
          INFORMATION
      ===================================================== */}

      <section className="command-information">

        <div>

          <FaShieldAlt />

          <span>
            Command Center provides a
            system-wide administrative view.
            Selecting a priority case opens
            its corresponding management
            section.
          </span>

        </div>


        <button
          onClick={() =>
            setActiveView(
              "dashboard"
            )
          }
        >

          Return to Dashboard

          <FaChevronRight />

        </button>

      </section>

    </div>
  );
}


export default AdminCommandCenter;