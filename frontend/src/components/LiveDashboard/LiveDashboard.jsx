import "./LiveDashboard.css";
import {
  FaExclamationTriangle,
  FaUsers,
  FaHandsHelping,
  FaHome,
  FaMapMarkerAlt,
} from "react-icons/fa";

function LiveDashboard() {
  return (
    <div className="live-dashboard">

      <div className="dashboard-header">
        <span className="status-dot"></span>
        Live Response
      </div>

      <div className="dashboard-item">
        <FaExclamationTriangle />
        <div>
          <h4>Active Incidents</h4>
          <span>Floods • Cyclones • Landslides</span>
        </div>
      </div>

      <div className="dashboard-item">
        <FaUsers />
        <div>
          <h4>Rescue Teams</h4>
          <span>Deployed Across India</span>
        </div>
      </div>

      <div className="dashboard-item">
        <FaHome />
        <div>
          <h4>Relief Shelters</h4>
          <span>Open & Operational</span>
        </div>
      </div>

      <div className="dashboard-item">
        <FaMapMarkerAlt />
        <div>
          <h4>Nationwide Coverage</h4>
          <span>24×7 Monitoring</span>
        </div>
      </div>

    </div>
  );
}

export default LiveDashboard;