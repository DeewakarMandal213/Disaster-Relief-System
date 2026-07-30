import "./Dashboard.css";
import dashboardImage from "../../assets/images/dashboard.jpg";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

function Dashboard() {
  return (
    <section className="dashboard-preview">

      <div className="dashboard-container">

        <div className="dashboard-content">

          <span className="section-tag">LIVE MONITORING</span>

          <h2>
            Government & NGO
            <br />
            Coordination Dashboard
          </h2>

          <p>
            Monitor disasters, volunteers, donations, shelters,
            rescue requests and relief distribution from one
            centralized dashboard with real-time analytics.
          </p>

          <Link to="/login" className="primary-btn">
            Explore Dashboard
            <FaArrowRight />
          </Link>

        </div>

        <div className="dashboard-image">
          <img src={dashboardImage} alt="Dashboard" />
        </div>

      </div>

    </section>
  );
}

export default Dashboard;