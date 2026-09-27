import "./Navbar.css";
import logo from "../../assets/images/logo.jpg";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
  const [scroll, setScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScroll(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={scroll ? "navbar glass" : "navbar"}>
      <div className="nav-container">

        {/* Logo */}
        <Link to="/" className="logo">
          <img src={logo} alt="ReliefConnect" />
        </Link>

        {/* Navigation */}
        <ul className="nav-links">

          <li>
            <a href="/#about">About</a>
          </li>

          <li>
            <a href="/#features">Features</a>
          </li>

          <li>
            <a href="/#dashboard">Dashboard</a>
          </li>

          <li>
            <a href="/#donation">Donate</a>
          </li>

          <li>
            <a href="/#contact">Contact</a>
          </li>

        </ul>

        {/* Buttons */}
        <div className="nav-buttons">

          <Link to="/login" className="login-btn">
            Login
          </Link>

          <Link to="/register" className="register-btn">
            Register
          </Link>

        </div>

      </div>
    </nav>
  );
}

export default Navbar;