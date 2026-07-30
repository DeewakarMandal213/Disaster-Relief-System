import "./DashboardPreview.css";
import dashboardImage from "../../assets/images/dashboard.jpg";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

function DashboardPreview() {
  return (
    <section className="dashboard-preview">

      <div className="dashboard-container">

        <div className="dashboard-content">

          <span className="section-tag">
            LIVE COORDINATION
          </span>

          <h2>
            Monitor Everything
            <br />
            From One Dashboard
          </h2>

          <p>
            Government agencies and NGOs can monitor rescue requests,
            volunteer activities, relief camps, donations and disaster
            alerts through a centralized dashboard with real-time updates.
          </p>

          <Link to="/login" className="primary-btn">
            View Dashboard
            <FaArrowRight />
          </Link>

        </div>

        <div className="dashboard-browser">

          <div className="browser-top">

            <span className="dot red"></span>
            <span className="dot yellow"></span>
            <span className="dot green"></span>

          </div>

          <img src={dashboardImage} alt="Dashboard" />

        </div>

      </div>

    </section>
  );
}

export default DashboardPreview;