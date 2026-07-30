import "./About.css";
import aboutImage from "../../assets/images/about.jpg";

import {
  FaHandsHelping,
  FaMapMarkedAlt,
  FaUsers,
  FaShieldAlt,
} from "react-icons/fa";

function About() {
  return (
    <section className="about" id="about">
      <div className="about-container">

        <div className="about-image">
          <img src={aboutImage} alt="About ReliefConnect" />
        </div>

        <div className="about-content">

          <span className="section-tag">ABOUT US</span>

          <h2>
            One Platform for Faster
            <br />
            Disaster Response
          </h2>

          <p>
            ReliefConnect is a disaster management platform that
            connects citizens, volunteers, NGOs, donors, and
            government authorities to coordinate rescue operations,
            distribute relief materials, and provide emergency
            assistance quickly and efficiently.
          </p>

          <div className="about-grid">

            <div className="about-card">
              <FaHandsHelping />
              <h4>Volunteer Network</h4>
              <p>Verified volunteers ready to help.</p>
            </div>

            <div className="about-card">
              <FaMapMarkedAlt />
              <h4>Live Tracking</h4>
              <p>Monitor disasters and shelters in real time.</p>
            </div>

            <div className="about-card">
              <FaUsers />
              <h4>Community Support</h4>
              <p>Citizens and NGOs working together.</p>
            </div>

            <div className="about-card">
              <FaShieldAlt />
              <h4>Trusted Platform</h4>
              <p>Secure coordination during emergencies.</p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default About;