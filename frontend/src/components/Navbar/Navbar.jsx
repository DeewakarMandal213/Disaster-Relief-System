import "./Navbar.css";
import logo from "../../assets/images/logo.jpg";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={scrolled ? "navbar active" : "navbar"}>
      <div className="container">

        <Link className="logo" to="/">
            <img src={logo} alt="ReliefConnect" />

            <div className="logo-text">
                <span className="relief">Relief</span>
                <span className="connect">Connect</span>
            </div>
        </Link>
        
        <ul className={menuOpen ? "nav-links active" : "nav-links"}>
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#volunteer">Volunteer</a></li>
          <li><a href="#donation">Donate</a></li>
          <li><a href="#contact">Contact</a></li>

          <li className="nav-buttons">
            <Link to="/login" className="login-btn">
              Login
            </Link>

            <Link to="/register" className="register-btn">
              Register
            </Link>
          </li>
        </ul>

        <div
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>

      </div>
    </nav>
  );
}

export default Navbar;