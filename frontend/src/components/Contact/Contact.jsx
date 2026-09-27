import "./Contact.css";
import contactImage from "../../assets/images/contact.jpg";

import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaGlobe,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaClock,
  FaUsers,
  FaShieldAlt,
  FaHandshake,
  FaHeadset,
  FaPaperPlane,
  FaUser,
  FaTag,
  FaPencilAlt,
} from "react-icons/fa";

function Contact() {
  return (
    <section className="contact-section">

      <div className="contact-visual">

        {/* =========================================
            BACKGROUND IMAGE
        ========================================= */}

        <img
          src={contactImage}
          alt="ReliefConnect support team"
          className="contact-background"
        />


        {/* =========================================
            WHITE LEFT PANEL
        ========================================= */}

        <div className="contact-white-panel"></div>


        {/* =========================================
            MAIN CONTACT CONTENT
        ========================================= */}

        <div className="contact-main-content">

          {/* LOGO / BRAND */}

          <div className="contact-brand">
            <div className="contact-brand-icon">
              <span>✚</span>
            </div>

            <div>
              <div className="contact-brand-name">
                Relief<span>Connect</span>
              </div>

              <div className="contact-brand-tagline">
                Together We Save Lives
              </div>
            </div>
          </div>


          {/* HEADING */}

          <div className="contact-heading-area">

            <h1>
              We're Here to Help
            </h1>

            <div className="contact-orange-line"></div>

            <p>
              Have questions, need assistance, or want to collaborate?
              <br />
              Reach out to us. Our team is ready to support you.
            </p>

          </div>


          {/* =========================================
              CONTACT DETAILS + FORM
          ========================================= */}

          <div className="contact-middle">

            {/* =====================================
                CONTACT DETAILS
            ===================================== */}

            <div className="contact-details">

              {/* PHONE */}

              <div className="contact-detail">

                <div className="contact-detail-icon">
                  <FaPhoneAlt />
                </div>

                <div className="contact-detail-text">

                  <h3>
                    Emergency Helpline
                  </h3>

                  <strong>
                    +91 1800-123-4567
                  </strong>

                  <p>
                    24/7 – For urgent disaster assistance
                  </p>

                </div>

              </div>


              {/* EMAIL */}

              <div className="contact-detail">

                <div className="contact-detail-icon">
                  <FaEnvelope />
                </div>

                <div className="contact-detail-text">

                  <h3>
                    Email Us
                  </h3>

                  <strong>
                    support@reliefconnect.org
                  </strong>

                  <p>
                    We reply within 24 hours
                  </p>

                </div>

              </div>


              {/* LOCATION */}

              <div className="contact-detail">

                <div className="contact-detail-icon">
                  <FaMapMarkerAlt />
                </div>

                <div className="contact-detail-text">

                  <h3>
                    Head Office
                  </h3>

                  <p className="contact-normal-text">
                    ReliefConnect Foundation
                    <br />
                    123, Humanitarian Lane, Sector 45
                    <br />
                    New Delhi – 110045, India
                  </p>

                </div>

              </div>


              {/* WEBSITE */}

              <div className="contact-detail">

                <div className="contact-detail-icon">
                  <FaGlobe />
                </div>

                <div className="contact-detail-text">

                  <h3>
                    Website
                  </h3>

                  <strong>
                    www.reliefconnect.org
                  </strong>

                  <p>
                    Visit our website for more information
                  </p>

                </div>

              </div>


              {/* SOCIAL MEDIA */}

              <div className="contact-social">

                <h3>
                  Follow Us
                </h3>

                <div className="social-icons">

                  <a href="#" aria-label="Facebook">
                    <FaFacebookF />
                  </a>

                  <a href="#" aria-label="Twitter">
                    <FaTwitter />
                  </a>

                  <a href="#" aria-label="Instagram">
                    <FaInstagram />
                  </a>

                  <a href="#" aria-label="LinkedIn">
                    <FaLinkedinIn />
                  </a>

                  <a href="#" aria-label="YouTube">
                    <FaYoutube />
                  </a>

                </div>

              </div>

            </div>


            {/* =====================================
                CONTACT FORM
            ===================================== */}

            <div className="contact-form-card">

              <h2>
                Send Us a Message
              </h2>

              <div className="form-orange-line"></div>


              <form>

                {/* NAME */}

                <div className="contact-input-wrapper">

                  <input
                    type="text"
                    placeholder="Your Name"
                  />

                  <FaUser />

                </div>


                {/* EMAIL */}

                <div className="contact-input-wrapper">

                  <input
                    type="email"
                    placeholder="Email Address"
                  />

                  <FaEnvelope />

                </div>


                {/* SUBJECT */}

                <div className="contact-input-wrapper">

                  <input
                    type="text"
                    placeholder="Subject"
                  />

                  <FaTag />

                </div>


                {/* MESSAGE */}

                <div className="contact-textarea-wrapper">

                  <textarea
                    rows="5"
                    placeholder="Your Message"
                  ></textarea>

                  <FaPencilAlt />

                </div>


                {/* SEND BUTTON */}

                <button
                  type="button"
                  className="contact-send-btn"
                >

                  <span>
                    Send Message
                  </span>

                  <FaPaperPlane />

                </button>

              </form>

            </div>

          </div>

        </div>


        {/* =========================================
            BOTTOM SUPPORT STRIP
        ========================================= */}

        <div className="contact-support-strip">

          {/* 24/7 SUPPORT */}

          <div className="support-item">

            <div className="support-icon">
              <FaClock />
            </div>

            <div>
              <h3>
                24/7 Support
              </h3>

              <p>
                Our team is available
                <br />
                round the clock for
                <br />
                emergencies.
              </p>
            </div>

          </div>


          {/* QUICK RESPONSE */}

          <div className="support-item">

            <div className="support-icon">
              <FaUsers />
            </div>

            <div>
              <h3>
                Quick Response
              </h3>

              <p>
                We act fast to provide
                <br />
                timely help and save
                <br />
                lives.
              </p>
            </div>

          </div>


          {/* RELIABLE SUPPORT */}

          <div className="support-item">

            <div className="support-icon">
              <FaShieldAlt />
            </div>

            <div>
              <h3>
                Reliable Support
              </h3>

              <p>
                Trusted by communities
                <br />
                and partners across
                <br />
                India.
              </p>
            </div>

          </div>


          {/* STRONGER TOGETHER */}

          <div className="support-item">

            <div className="support-icon">
              <FaHandshake />
            </div>

            <div>
              <h3>
                Stronger Together
              </h3>

              <p>
                Your support helps us
                <br />
                build a safer and more
                <br />
                resilient nation.
              </p>
            </div>

          </div>

        </div>


        {/* =========================================
            GENERAL INQUIRIES CARD
        ========================================= */}

        <div className="general-inquiries">

          <div className="general-inquiry-content">

            <h2>
              General Inquiries
            </h2>

            <div className="general-orange-line"></div>

            <p>
              For partnership, media, donation
              related or other general inquiries,
              please reach out to us via email.
            </p>

          </div>


          <div className="headset-circle">

            <FaHeadset />

            <strong>
              24/7
            </strong>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Contact;