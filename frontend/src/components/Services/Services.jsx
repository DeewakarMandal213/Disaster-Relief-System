import "./Services.css";

import {
  FaBell,
  FaMapMarkedAlt,
  FaUsers,
  FaHandHoldingHeart,
  FaClinicMedical,
  FaChartLine,
} from "react-icons/fa";

function Services() {
  return (
    <section className="services" id="services">

      <div className="services-heading">

        <span className="section-tag">
          OUR SERVICES
        </span>

        <h2>
          Everything Needed During
          <br />
          Disaster Response
        </h2>

        <p>
          ReliefConnect provides one integrated platform for rescue,
          relief coordination, volunteer management and emergency
          assistance.
        </p>

      </div>

      <div className="services-grid">

        <div className="service-card">
          <FaBell />
          <h3>SOS Emergency</h3>
          <p>Instant emergency requests with live location sharing.</p>
        </div>

        <div className="service-card">
          <FaMapMarkedAlt />
          <h3>Live Disaster Map</h3>
          <p>Track disasters, shelters and rescue operations.</p>
        </div>

        <div className="service-card">
          <FaUsers />
          <h3>Volunteer Network</h3>
          <p>Verified volunteers assisting affected communities.</p>
        </div>

        <div className="service-card">
          <FaHandHoldingHeart />
          <h3>Donation Support</h3>
          <p>Transparent donations with real-time distribution.</p>
        </div>

        <div className="service-card">
          <FaClinicMedical />
          <h3>Medical Assistance</h3>
          <p>Locate nearby hospitals, camps and health support.</p>
        </div>

        <div className="service-card">
          <FaChartLine />
          <h3>Government Dashboard</h3>
          <p>Monitor disaster response with live analytics.</p>
        </div>

      </div>

    </section>
  );
}

export default Services;