import "./Emergency.css";
import emergencyImage from "../../assets/images/emergency.jpg";

import { Link } from "react-router-dom";
import {
  FaPhoneAlt,
  FaAmbulance,
  FaArrowRight,
  FaExclamationTriangle,
} from "react-icons/fa";

function Emergency() {
  return (
    <section className="emergency" id="emergency">

      <div className="emergency-container">

        <div className="emergency-image">
          <img src={emergencyImage} alt="Emergency Rescue" />
        </div>

        <div className="emergency-content">

          <span className="section-tag">
            EMERGENCY RESPONSE
          </span>

          <h2>
            Immediate Help
            <br />
            When Every Second Matters
          </h2>

          <p>
            During disasters, ReliefConnect enables citizens to send
            SOS alerts, locate nearby shelters, request rescue
            assistance and stay connected with emergency response
            teams in real time.
          </p>

          <div className="emergency-grid">

            <div className="emergency-box">
              <FaPhoneAlt />
              <span>24×7 Emergency Support</span>
            </div>

            <div className="emergency-box">
              <FaAmbulance />
              <span>NDRF / SDRF Coordination</span>
            </div>

            <div className="emergency-box">
              <FaExclamationTriangle />
              <span>Instant SOS Alerts</span>
            </div>

          </div>

          <Link className="primary-btn" to="/register">
            Request Emergency Help
            <FaArrowRight />
          </Link>

        </div>

      </div>

    </section>
  );
}

export default Emergency;