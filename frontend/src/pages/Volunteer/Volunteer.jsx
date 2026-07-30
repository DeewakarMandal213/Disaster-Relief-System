import "./Volunteer.css";
import volunteerImage from "../../assets/images/volunteer.jpg";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

function Volunteer() {
  return (
    <section className="volunteer" id="volunteer">
      <div className="volunteer-container">

        <div className="volunteer-image">
          <img src={volunteerImage} alt="Volunteer" />
        </div>

        <div className="volunteer-content">

          <span className="section-tag">VOLUNTEER NETWORK</span>

          <h2>
            Become A Volunteer
            <br />
            Save Lives Together
          </h2>

          <p>
            Join ReliefConnect's verified volunteer network and
            assist during floods, cyclones, earthquakes, landslides,
            and other emergencies. Coordinate with NGOs and
            government agencies to deliver timely relief.
          </p>

          <ul>
            <li>✔ Verified Volunteer Registration</li>
            <li>✔ Real-time Rescue Coordination</li>
            <li>✔ Disaster Relief Distribution</li>
            <li>✔ Medical & Emergency Assistance</li>
          </ul>

          <Link to="/register" className="primary-btn">
            Become a Volunteer
            <FaArrowRight />
          </Link>

        </div>

      </div>
    </section>
  );
}

export default Volunteer;