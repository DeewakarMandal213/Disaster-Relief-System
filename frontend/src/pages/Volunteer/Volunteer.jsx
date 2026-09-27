import "./Volunteer.css";

import volunteerImage from "../../assets/images/volunteer.jpg";

import {
  FaShieldAlt,
  FaMapMarkedAlt,
  FaFirstAid,
  FaHandsHelping,
  FaUsers,
  FaArrowRight,
} from "react-icons/fa";

import { Link } from "react-router-dom";

function Volunteer() {
  return (
    <section className="volunteer-section">

      {/* =========================================
          BACKGROUND IMAGE
      ========================================= */}

      <div className="volunteer-visual">

        <img
          src={volunteerImage}
          alt="ReliefConnect volunteers helping communities"
          className="volunteer-main-image"
        />

        <div className="volunteer-overlay"></div>


        {/* =========================================
            MAIN CONTENT
        ========================================= */}

        <div className="volunteer-content">

          {/* Section Label */}
          <div className="volunteer-label">
            VOLUNTEER NETWORK
          </div>


          {/* Main Heading */}
          <h1 className="volunteer-heading">
            Be The Help
            <br />
            Someone Needs Today.
            <br />

            <span>Save Lives Together.</span>
          </h1>


          {/* Description */}
          <p className="volunteer-description">
            Join ReliefConnect's verified volunteer network and help
            communities during floods, cyclones, earthquakes and other
            emergencies. Every helping hand can make a real difference
            when people need it most.
          </p>


          {/* =========================================
              FEATURE CARDS
          ========================================= */}

          <div className="volunteer-features">

            {/* Card 1 */}
            <div className="volunteer-feature-card">

              <div className="volunteer-feature-icon">
                <FaShieldAlt />
              </div>

              <div className="volunteer-feature-content">
                <h3>Verified Volunteers</h3>

                <p>
                  Trusted & accountable network
                  for safe and reliable support.
                </p>
              </div>

            </div>


            {/* Card 2 */}
            <div className="volunteer-feature-card">

              <div className="volunteer-feature-icon">
                <FaMapMarkedAlt />
              </div>

              <div className="volunteer-feature-content">
                <h3>Live Coordination</h3>

                <p>
                  Connect with nearby emergencies
                  and respond in real-time.
                </p>
              </div>

            </div>


            {/* Card 3 */}
            <div className="volunteer-feature-card">

              <div className="volunteer-feature-icon">
                <FaFirstAid />
              </div>

              <div className="volunteer-feature-content">
                <h3>Emergency Support</h3>

                <p>
                  Assist in rescue, medical aid
                  and essential relief operations.
                </p>
              </div>

            </div>


            {/* Card 4 */}
            <div className="volunteer-feature-card">

              <div className="volunteer-feature-icon">
                <FaHandsHelping />
              </div>

              <div className="volunteer-feature-content">
                <h3>Make An Impact</h3>

                <p>
                  Help rebuild affected communities
                  and bring hope to more lives.
                </p>
              </div>

            </div>

          </div>


          {/* =========================================
              BUTTONS
          ========================================= */}

          <div className="volunteer-actions">

            <Link
              to="/register"
              className="volunteer-primary-btn"
            >
              Become a Volunteer
              <FaArrowRight />
            </Link>


            <Link
              to="/login"
              className="volunteer-secondary-btn"
            >
              Volunteer Login
            </Link>

          </div>


          {/* =========================================
              MOTIVATION BOX
          ========================================= */}

          <div className="volunteer-message">

            <div className="volunteer-message-icon">
              <FaUsers />
            </div>

            <p>
              Your time, skills and compassion can create a stronger,
              safer and more prepared community for everyone.
            </p>

          </div>


          {/* =========================================
              BOTTOM MESSAGE
          ========================================= */}

          <div className="volunteer-bottom-message">

            <strong>
              One Person Can Make A Difference.
            </strong>

            <span className="message-divider">|</span>

            <span className="message-highlight">
              Be there when someone needs help.
            </span>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Volunteer;