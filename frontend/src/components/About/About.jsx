import "./About.css";

import {
  FaBolt,
  FaHandshake,
  FaMapMarkedAlt,
} from "react-icons/fa";

import aboutImage from "../../assets/images/about.jpg";

function About() {
  return (
    <section className="about-section">

      <div className="about-visual">

        {/* Background Image */}
        <img
          src={aboutImage}
          alt="ReliefConnect disaster relief volunteers helping communities"
          className="about-main-image"
        />

        {/* Dark overlay */}
        <div className="about-image-overlay"></div>


        {/* ================================
            RIGHT CONTENT
        ================================= */}

        <div className="about-content">

          {/* Label */}
          <div className="about-label">
            ABOUT RELIEFCONNECT
          </div>


          {/* Main Heading */}
          <h1 className="about-heading">
            One Platform.
            <br />
            Countless Lives Protected.
          </h1>


          {/* Description */}
          <p className="about-description">
            ReliefConnect is a centralized disaster response platform
            connecting citizens, volunteers, NGOs, donors and government
            authorities to coordinate rescue operations, emergency support
            and transparent relief distribution during natural disasters.
          </p>


          {/* ================================
              FOUR FEATURE CARDS
          ================================= */}

          <div className="about-features">

            {/* Fast Response */}
            <div className="about-feature-card">

              <div className="feature-icon">
                <FaBolt />
              </div>

              <div className="feature-content">
                <h3>Fast Response</h3>

                <p>
                  Immediate emergency coordination.
                </p>
              </div>

            </div>


            {/* Verified Volunteers */}
            <div className="about-feature-card">

              <div className="feature-icon">
                <FaHandshake />
              </div>

              <div className="feature-content">
                <h3>Verified Volunteers</h3>

                <p>
                  Trusted community support.
                </p>
              </div>

            </div>


            {/* Live Tracking */}
            <div className="about-feature-card">

              <div className="feature-icon">
                <FaMapMarkedAlt />
              </div>

              <div className="feature-content">
                <h3>Live Tracking</h3>

                <p>
                  Monitor shelters and requests.
                </p>
              </div>

            </div>


            {/* Transparent Donations */}
            <div className="about-feature-card">

              <div className="feature-icon rupee-icon">
                ₹
              </div>

              <div className="feature-content">
                <h3>Transparent Donations</h3>

                <p>
                  Every contribution is accountable.
                </p>
              </div>

            </div>

          </div>


          {/* ================================
              LEARN MORE
              CENTERED UNDER 4 CARDS
          ================================= */}

          <div className="about-learn-wrapper">

            <button className="about-learn-btn">
              <span>Learn More</span>
              <span className="learn-arrow">→</span>
            </button>

          </div>

        </div>


        {/* ================================
            NGO PARTNERS
        ================================= */}

        <div className="ngo-partners">

          <div className="ngo-title">
            <h3>
              Our NGO
              <br />
              Partners
            </h3>
          </div>


          <div className="ngo-list">

            <div className="ngo-card">
              <div className="ngo-symbol">🌿</div>

              <div>
                <strong>SEVA SAATHI</strong>
                <span>Together for Tomorrow</span>
              </div>
            </div>


            <div className="ngo-card">
              <div className="ngo-symbol">🤝</div>

              <div>
                <strong>SAKSHAM FOUNDATION</strong>
                <span>Empowering Communities</span>
              </div>
            </div>


            <div className="ngo-card">
              <div className="ngo-symbol">💗</div>

              <div>
                <strong>CARE FOR ALL</strong>
                <span>Humanity in Action</span>
              </div>
            </div>


            <div className="ngo-card">
              <div className="ngo-symbol">🌱</div>

              <div>
                <strong>PRAGATI FOUNDATION</strong>
                <span>Building Better Lives</span>
              </div>
            </div>


            <div className="ngo-card">
              <div className="ngo-symbol">🕊️</div>

              <div>
                <strong>JAN KALYAN SEVA</strong>
                <span>Stronger Communities</span>
              </div>
            </div>


            <div className="ngo-card">
              <div className="ngo-symbol">☀️</div>

              <div>
                <strong>AKSHAYA TRUST</strong>
                <span>Hope. Help. Healing.</span>
              </div>
            </div>


            <div className="ngo-more">
              <strong>Many More</strong>
              <span>Partners Across India</span>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default About;