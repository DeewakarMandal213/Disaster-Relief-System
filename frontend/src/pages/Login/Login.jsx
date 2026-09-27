import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaEnvelope,
  FaLock,
  FaArrowRight,
} from "react-icons/fa";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================================================
  // HANDLE INPUT CHANGE
  // =========================================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  // =========================================================
  // HANDLE LOGIN
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // Basic validation
    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      // Login through AuthContext
      const user = await login(
        formData.email,
        formData.password
      );

      console.log("Logged in user:", user);
      console.log("User role:", user?.role);

      // =====================================================
      // ROLE-BASED REDIRECTION
      // =====================================================
      // Each role has its own authenticated home/dashboard.
      //
      // IMPORTANT:
      // /volunteer        = PUBLIC Volunteer landing page
      // /volunteer/dashboard = AUTHENTICATED Volunteer Home
      // =====================================================

      switch (user?.role) {
        case "Citizen":
          navigate("/citizen");
          break;

        case "Volunteer":
          navigate("/volunteer/dashboard");
          break;

        case "Donor":
          navigate("/donor");
          break;

        case "NGO":
          navigate("/ngo");
          break;

        case "Government":
          navigate("/government");
          break;

        case "Admin":
          navigate("/admin");
          break;

        default:
          console.error(
            "Unknown user role:",
            user?.role
          );

          setError(
            "Login successful, but your account role could not be recognized."
          );
          break;
      }
    } catch (error) {
      console.error("Login error:", error);

      const message =
        error.response?.data?.message ||
        "Login failed. Please check your email and password.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="login-page">

      <div className="login-card">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="login-header">

          <h1>Welcome Back</h1>

          <p>
            Login to your ReliefConnect account
          </p>

        </div>


        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}


        {/* =================================================
            LOGIN FORM
        ================================================= */}

        <form onSubmit={handleSubmit}>

          {/* EMAIL */}

          <div className="login-input-group">

            <label>Email Address</label>

            <div className="login-input-wrapper">

              <FaEnvelope />

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />

            </div>

          </div>


          {/* PASSWORD */}

          <div className="login-input-group">

            <label>Password</label>

            <div className="login-input-wrapper">

              <FaLock />

              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
              />

            </div>

          </div>


          {/* =================================================
              LOGIN BUTTON
          ================================================= */}

          <button
            type="submit"
            className="login-submit-btn"
            disabled={loading}
          >

            {loading ? (
              "Logging in..."
            ) : (
              <>
                Login
                <FaArrowRight />
              </>
            )}

          </button>

        </form>


        {/* =================================================
            REGISTER
        ================================================= */}

        <div className="login-register">

          <span>
            Don't have an account?
          </span>

          <Link to="/register">
            Create an account
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Login;