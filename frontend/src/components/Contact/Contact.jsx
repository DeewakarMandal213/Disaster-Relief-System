import "./Contact.css";
import contactImage from "../../assets/images/contact.jpg";

import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt
} from "react-icons/fa";

function Contact() {
  return (
    <section className="contact" id="contact">

      <div className="contact-container">

        <div className="contact-image">
          <img src={contactImage} alt="Contact ReliefConnect" />
        </div>

        <div className="contact-content">

          <span className="section-tag">
            CONTACT US
          </span>

          <h2>
            We're Here
            <br />
            To Help You
          </h2>

          <p>
            Reach out to ReliefConnect for disaster assistance,
            volunteer opportunities, partnerships or emergency
            support.
          </p>

          <div className="contact-info">

            <div className="info-card">
              <FaPhoneAlt />
              <div>
                <h4>Emergency Helpline</h4>
                <p>+91 1800-123-4567</p>
              </div>
            </div>

            <div className="info-card">
              <FaEnvelope />
              <div>
                <h4>Email</h4>
                <p>support@reliefconnect.org</p>
              </div>
            </div>

            <div className="info-card">
              <FaMapMarkerAlt />
              <div>
                <h4>Head Office</h4>
                <p>Kolkata, India</p>
              </div>
            </div>

          </div>

          <form className="contact-form">

            <input
              type="text"
              placeholder="Full Name"
            />

            <input
              type="email"
              placeholder="Email Address"
            />

            <textarea
              rows="5"
              placeholder="Your Message"
            ></textarea>

            <button className="primary-btn">
              Send Message
            </button>

          </form>

        </div>

      </div>

    </section>
  );
}

export default Contact;