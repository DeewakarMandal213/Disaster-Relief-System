import "./Footer.css";

import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
  FaHandsHelping
} from "react-icons/fa";

import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        {/* =========================
            ABOUT
        ========================= */}

        <div className="footer-about">

          <div className="footer-logo">

            <div className="footer-logo-icon">
              <FaHandsHelping />
            </div>

            <h3>
              Relief<span>Connect</span>
            </h3>

          </div>

          <p>
            Connecting communities, volunteers, NGOs and
            government agencies for faster disaster response.
          </p>


          {/* SOCIAL LINKS */}

          <div className="social-icons">

            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FaFacebookF />
            </a>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>

            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <FaLinkedinIn />
            </a>

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <FaGithub />
            </a>

          </div>

        </div>


        {/* =========================
            QUICK LINKS
        ========================= */}

        <div className="footer-column">

          <h4>Quick Links</h4>

          <ul>
            <li>
              <a href="/">Home</a>
            </li>

            <li>
              <a href="/#about">About</a>
            </li>

            <li>
              <a href="/#features">Services</a>
            </li>

            <li>
              <a href="/#features">Volunteer</a>
            </li>

            <li>
              <a href="/#donation">Donate</a>
            </li>
          </ul>

        </div>


        {/* =========================
            SERVICES
        ========================= */}

        <div className="footer-column">

          <h4>Services</h4>

          <ul>
            <li>
              <a href="/#contact">Emergency SOS</a>
            </li>

            <li>
              <a href="/#features">Relief Camps</a>
            </li>

            <li>
              <a href="/#features">Volunteer Network</a>
            </li>

            <li>
              <a href="/#contact">Disaster Map</a>
            </li>

            <li>
              <a href="/#donation">Donation</a>
            </li>
          </ul>

        </div>

      </div>


      {/* =========================
          COPYRIGHT
      ========================= */}

      <div className="copyright">

        © 2026 ReliefConnect | All Rights Reserved

      </div>

    </footer>
  );
}

export default Footer;