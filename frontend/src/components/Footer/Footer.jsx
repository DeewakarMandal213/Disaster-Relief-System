import "./Footer.css";
import logo from "../../assets/images/logo-icon.png";

import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaGithub
} from "react-icons/fa";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        <div className="footer-about">

          <div className="footer-logo">
            <img src={logo} alt="ReliefConnect" />

            <h3>ReliefConnect</h3>
          </div>

          <p>
            Connecting communities, volunteers, NGOs and
            government agencies for faster disaster response.
          </p>

          <div className="social-icons">
            <FaFacebookF />
            <FaInstagram />
            <FaLinkedinIn />
            <FaGithub />
          </div>

        </div>

        <div>

          <h4>Quick Links</h4>

          <ul>
            <li>Home</li>
            <li>About</li>
            <li>Services</li>
            <li>Volunteer</li>
            <li>Donate</li>
          </ul>

        </div>

        <div>

          <h4>Services</h4>

          <ul>
            <li>Emergency SOS</li>
            <li>Relief Camps</li>
            <li>Volunteer Network</li>
            <li>Disaster Map</li>
            <li>Donation</li>
          </ul>

        </div>

      </div>

      <div className="copyright">

        © 2026 ReliefConnect | All Rights Reserved

      </div>

    </footer>
  );
}

export default Footer;