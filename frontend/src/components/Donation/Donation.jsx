import "./Donation.css";

import donationImage from "../../assets/images/donation.jpg";

import {
  FaHandHoldingHeart,
  FaShieldAlt,
  FaMapMarkedAlt,
  FaUsers,
  FaArrowRight,
} from "react-icons/fa";

import { Link } from "react-router-dom";

function Donation() {
  return (
    <section className="donation-section">

      <div className="donation-visual">

        {/* =========================================
            BACKGROUND IMAGE
        ========================================= */}

        <img
          src={donationImage}
          alt="ReliefConnect donation and relief distribution"
          className="donation-main-image"
        />

        {/* DARK OVERLAY */}

        <div className="donation-overlay"></div>


        {/* =========================================
            MAIN CONTENT
        ========================================= */}

        <div className="donation-content">

          {/* SECTION LABEL */}

          <div className="donation-label">
            MAKE A DIFFERENCE
          </div>


          {/* MAIN HEADING */}

          <h1 className="donation-heading">
            Every Donation Brings
            <br />
            Hope To Families.
            <br />

            <span>Together, We Rebuild Lives.</span>
          </h1>


          {/* DESCRIPTION */}

          <p className="donation-description">
            Your contribution helps provide food, clean water,
            medicines, temporary shelter, rescue equipment and
            emergency supplies to disaster-affected communities
            across India.
          </p>


          {/* =========================================
              FEATURE TABS
          ========================================= */}

          <div className="donation-features">

            {/* TAB 1 */}

            <div className="donation-feature-card">

              <div className="donation-feature-icon">
                <FaHandHoldingHeart />
              </div>

              <div className="donation-feature-content">

                <h3>
                  100% Transparent Distribution
                </h3>

                <p>
                  Every contribution reaches verified
                  relief efforts.
                </p>

              </div>

            </div>


            {/* TAB 2 */}

            <div className="donation-feature-card">

              <div className="donation-feature-icon">
                <FaShieldAlt />
              </div>

              <div className="donation-feature-content">

                <h3>
                  Verified NGOs & Government Partners
                </h3>

                <p>
                  Donations are coordinated with
                  trusted organizations.
                </p>

              </div>

            </div>


            {/* TAB 3 */}

            <div className="donation-feature-card">

              <div className="donation-feature-icon">
                <FaMapMarkedAlt />
              </div>

              <div className="donation-feature-content">

                <h3>
                  Live Donation Tracking
                </h3>

                <p>
                  Track how your contribution
                  is being used.
                </p>

              </div>

            </div>

          </div>


          {/* =========================================
              BUTTONS
          ========================================= */}

          <div className="donation-actions">

            <Link
              to="/register"
              className="donation-primary-btn"
            >
              Donate Now
              <FaArrowRight />
            </Link>


            <Link
              to="/login"
              className="donation-secondary-btn"
            >
              Donation Tracking
            </Link>

          </div>


          {/* =========================================
              MOTIVATION BOX
          ========================================= */}

          <div className="donation-message">

            <div className="donation-message-icon">
              <FaUsers />
            </div>

            <p>
              Your generosity can provide food, shelter,
              medical care and hope to families when they
              need it most.
            </p>

          </div>


          {/* =========================================
              BOTTOM MESSAGE
          ========================================= */}

          <div className="donation-bottom-message">

            <strong>
              Every Contribution Matters.
            </strong>

            <span className="donation-divider">
              |
            </span>

            <span className="donation-highlight">
              Give hope. Rebuild lives.
            </span>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Donation;