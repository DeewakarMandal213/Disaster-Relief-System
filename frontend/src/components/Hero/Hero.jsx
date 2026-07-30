import "./Hero.css";
import heroImage from "../../assets/images/hero.jpg";

import { Link } from "react-router-dom";
import { FaArrowRight, FaHandsHelping } from "react-icons/fa";

function Hero() {
  return (
    <section
      className="hero"
      id="home"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      <div className="overlay"></div>

      <div className="hero-content">

        <span className="hero-tag">
          Together We Save Lives
        </span>

        <h1>
          Connecting Communities <br />
          During Disasters
        </h1>

        <p>
          ReliefConnect helps citizens, volunteers, NGOs,
          donors and government authorities coordinate rescue,
          relief distribution and emergency support through one
          secure platform.
        </p>

        <div className="hero-buttons">
          <Link to="/register" className="primary-btn">
            Get Started
            <FaArrowRight />
          </Link>

          <Link to="/login" className="secondary-btn">
            <FaHandsHelping />
            Join as Volunteer
          </Link>
        </div>

      </div>
    </section>
  );
}

export default Hero;