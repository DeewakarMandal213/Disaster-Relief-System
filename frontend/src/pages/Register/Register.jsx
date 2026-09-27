import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaMapMarkerAlt,
  FaUserTag,
  FaArrowRight,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: "Citizen",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Basic validation
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.password ||
      !formData.phone ||
      !formData.address ||
      !formData.role
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      await register(formData);

      setSuccess(
        "Registration successful! Redirecting to login..."
      );

      setFormData({
        fullName: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        role: "Citizen",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);

      const message =
        error.response?.data?.message ||
        "Registration failed. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      <div className="register-card">

        {/* ================================
            HEADER
        ================================= */}

        <div className="register-header">

          <h1>Create Account</h1>

          <p>
            Join ReliefConnect and help communities
            respond faster to disasters.
          </p>

        </div>


        {/* ================================
            ERROR
        ================================= */}

        {error && (
          <div className="register-error">
            {error}
          </div>
        )}


        {/* ================================
            SUCCESS
        ================================= */}

        {success && (
          <div className="register-success">
            {success}
          </div>
        )}


        {/* ================================
            FORM
        ================================= */}

        <form onSubmit={handleSubmit}>

          {/* Full Name */}

          <div className="register-input-group">

            <label>Full Name</label>

            <div className="register-input-wrapper">

              <FaUser />

              <input
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                autoComplete="name"
              />

            </div>

          </div>


          {/* Email */}

          <div className="register-input-group">

            <label>Email Address</label>

            <div className="register-input-wrapper">

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


          {/* Phone */}

          <div className="register-input-group">

            <label>Phone Number</label>

            <div className="register-input-wrapper">

              <FaPhone />

              <input
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                autoComplete="tel"
              />

            </div>

          </div>


          {/* Address */}

          <div className="register-input-group">

            <label>Address</label>

            <div className="register-input-wrapper">

              <FaMapMarkerAlt />

              <input
                type="text"
                name="address"
                placeholder="Enter your address"
                value={formData.address}
                onChange={handleChange}
                autoComplete="street-address"
              />

            </div>

          </div>


          {/* Password */}

          <div className="register-input-group">

            <label>Password</label>

            <div className="register-input-wrapper">

              <FaLock />

              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
              />

            </div>

          </div>


          {/* Role */}

          <div className="register-input-group">

            <label>Select Your Role</label>

            <div className="register-input-wrapper">

              <FaUserTag />

              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="Citizen">
                  Citizen
                </option>

                <option value="Volunteer">
                  Volunteer
                </option>

                <option value="Donor">
                  Donor
                </option>

                <option value="NGO">
                  NGO
                </option>

                <option value="Government">
                  Government
                </option>
              </select>

            </div>

          </div>


          {/* Submit */}

          <button
            type="submit"
            className="register-submit-btn"
            disabled={loading}
          >

            {loading ? (
              "Creating Account..."
            ) : (
              <>
                Create Account
                <FaArrowRight />
              </>
            )}

          </button>

        </form>


        {/* ================================
            LOGIN LINK
        ================================= */}

        <div className="register-login">

          <span>
            Already have an account?
          </span>

          <Link to="/login">
            Login
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Register;