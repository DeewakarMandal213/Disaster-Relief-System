import "./Donation.css";
import donationImage from "../../assets/images/donation.jpg";
import { Link } from "react-router-dom";
import { FaArrowRight, FaHandHoldingHeart } from "react-icons/fa";

function Donation() {
  return (
    <section className="donation" id="donation">

      <div className="donation-container">

        <div className="donation-content">

          <span className="section-tag">MAKE A DIFFERENCE</span>

          <h2>
            Every Donation Brings
            <br />
            Hope To Families
          </h2>

          <p>
            Your contribution helps provide food, clean water,
            medicines, temporary shelter, rescue equipment and
            emergency supplies to disaster-affected communities
            across India.
          </p>

          <div className="donation-features">

            <div className="feature">
              <FaHandHoldingHeart />
              <span>100% Transparent Distribution</span>
            </div>

            <div className="feature">
              <FaHandHoldingHeart />
              <span>Verified NGOs & Government Partners</span>
            </div>

            <div className="feature">
              <FaHandHoldingHeart />
              <span>Live Donation Tracking</span>
            </div>

          </div>

          <Link to="/register" className="primary-btn">
            Donate Now
            <FaArrowRight />
          </Link>

        </div>

        <div className="donation-image">
          <img src={donationImage} alt="Donation" />
        </div>

      </div>

    </section>
  );
}

export default Donation;