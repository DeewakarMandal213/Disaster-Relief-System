import "./Hero.css";
import heroImage from "../../assets/images/hero.jpg";
import LiveDashboard from "../LiveDashboard/LiveDashboard";

import { Link } from "react-router-dom";

import {
  FaArrowRight,
  FaHandsHelping,
  FaUsers,
  FaHospital,
  FaBoxOpen,
  FaGlobeAsia
} from "react-icons/fa";

function Hero() {
  return (
    <section
      className="hero"
      id="home"
      style={{
        backgroundImage: `linear-gradient(rgba(8,20,43,.65), rgba(8,20,43,.78)), url(${heroImage})`,
      }}
    >
      <div className="hero-container">

        <div className="hero-left">

        <div className="hero-badge">
          <span className="live-dot"></span>
          Live Disaster Response
          <span className="badge-divider">|</span>
          24×7 Active
        </div>

          <h1>
            Disaster Response
            <br />
            Starts With
            <span> One Connection.</span>
          </h1>

          <p>
            ReliefConnect connects citizens, volunteers, NGOs,
            donors and government authorities into one unified
            disaster response platform that enables faster rescue,
            relief distribution and emergency coordination.
          </p>

          <div className="hero-buttons">

            <Link to="/register" className="primary-btn">
              🚨 Request Help
            </Link>

            <Link to="/register" className="secondary-btn">
              🤝 Become Volunteer
            </Link>

          </div>

        </div>

        <div className="hero-right">

           <LiveDashboard />

        </div>

      </div>

      <div className="hero-stats">

        <div className="stat-card">
          <FaBoxOpen />
          <h3>2,45,000+</h3>
          <p>Relief Kits</p>
        </div>

        <div className="stat-card">
          <FaUsers />
          <h3>18,765+</h3>
          <p>Volunteers</p>
        </div>

        <div className="stat-card">
          <FaHospital />
          <h3>542+</h3>
          <p>Shelters</p>
        </div>

        <div className="stat-card">
          <FaHandsHelping />
          <h3>48+</h3>
          <p>NGO Partners</p>
        </div>

        <div className="stat-card">
          <FaGlobeAsia />
          <h3>24×7</h3>
          <p>Emergency Response</p>
        </div>

      </div>

      <div className="scroll-indicator">

        <span>Scroll to Explore</span>

        <div className="mouse">
          <div className="wheel"></div>
        </div>

      </div>

    </section>
  );
}

export default Hero;