import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  useMapEvents,
} from "react-leaflet";
import API from "../../services/api";

import {
  FaArrowLeft,
  FaHandHoldingHeart,
  FaUtensils,
  FaTint,
  FaMedkit,
  FaHome,
  FaBoxOpen,
  FaMapMarkerAlt,
  FaPhone,
  FaPaperPlane,
  FaCrosshairs,
  FaLocationArrow,
} from "react-icons/fa";

import "leaflet/dist/leaflet.css";
import "./RequestAssistance.css";

const DEFAULT_MAP_CENTER = [13.0827, 80.2707];

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(event) {
      onLocationSelect([event.latlng.lat, event.latlng.lng]);
    },
  });
  return null;
}

function RequestAssistance() {
  const navigate = useNavigate();

  const [assistanceType, setAssistanceType] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [mapCoordinates, setMapCoordinates] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationMessage, setLocationMessage] = useState(
    "Click on the map to select the exact assistance location."
  );

  const [formData, setFormData] = useState({
    location: "",
    contactNumber: "",
    description: "",
  });

  const assistanceTypes = [
    { name: "Food", icon: <FaUtensils /> },
    { name: "Water", icon: <FaTint /> },
    { name: "Medical Help", icon: <FaMedkit /> },
    { name: "Shelter", icon: <FaHome /> },
    { name: "Essential Supplies", icon: <FaBoxOpen /> },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMapLocationSelect = (coordinates) => {
    setMapCoordinates(coordinates);
    setLocationMessage("Assistance location selected successfully.");
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage("Geolocation is not supported by this browser.");
      return;
    }

    setGettingLocation(true);
    setLocationMessage("Getting your current location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        setMapCoordinates(coordinates);
        setLocationMessage("Your current location has been selected.");
        setGettingLocation(false);
      },
      (error) => {
        console.error("Location permission error:", error);
        setLocationMessage(
          "Unable to access your current location. You can still select a location directly on the map."
        );
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!assistanceType) {
      alert("Please select the type of assistance you need.");
      return;
    }

    if (!formData.location.trim()) {
      alert("Please enter your assistance location.");
      return;
    }

    if (!mapCoordinates) {
      alert(
        "Please select the assistance location on the map. This allows the request to appear on the Disaster Map for NGOs and Government response teams."
      );
      return;
    }

    try {
      const response = await API.post("/assistance", {
        assistanceType,
        priority,
        location: formData.location,
        latitude: mapCoordinates[0],
        longitude: mapCoordinates[1],
        contactNumber: formData.contactNumber,
        description: formData.description,
      });

      console.log("Assistance request created:", response.data);
      alert("Assistance request submitted successfully.");
      navigate("/citizen");
    } catch (error) {
      console.error("Assistance submission failed:", error);
      alert(
        error.response?.data?.message ||
          "Failed to submit assistance request. Please try again."
      );
    }
  };

  return (
    <div className="request-assistance-page">
      <div className="request-assistance-header">
        <button className="back-button" onClick={() => navigate("/citizen")}>
          <FaArrowLeft />
          Back to Dashboard
        </button>

        <div className="assistance-page-title">
          <div className="assistance-title-icon">
            <FaHandHoldingHeart />
          </div>
          <div>
            <p>ASSISTANCE REQUEST</p>
            <h1>Request Assistance</h1>
          </div>
        </div>
      </div>

      <div className="assistance-info">
        <FaHandHoldingHeart />
        <div>
          <strong>Need emergency assistance?</strong>
          <p>
            Request food, water, medical help, shelter, or essential supplies.
            Select the exact location so response teams can find you on the map.
          </p>
        </div>
      </div>

      <form className="assistance-form-card" onSubmit={handleSubmit}>
        <section className="form-section">
          <h2>What assistance do you need?</h2>
          <p>Select the type of help you require.</p>

          <div className="assistance-types">
            {assistanceTypes.map((type) => (
              <button
                type="button"
                key={type.name}
                className={
                  assistanceType === type.name
                    ? "assistance-type-card selected"
                    : "assistance-type-card"
                }
                onClick={() => setAssistanceType(type.name)}
              >
                <span className="assistance-type-icon">{type.icon}</span>
                <strong>{type.name}</strong>
              </button>
            ))}
          </div>
        </section>

        <section className="form-section">
          <h2>Priority Level</h2>
          <p>Select how urgently you need this assistance.</p>

          <div className="priority-options">
            {["Low", "Medium", "High", "Critical"].map((level) => (
              <button
                type="button"
                key={level}
                className={
                  priority === level
                    ? `priority-btn active ${level.toLowerCase()}`
                    : `priority-btn ${level.toLowerCase()}`
                }
                onClick={() => setPriority(level)}
              >
                {level}
              </button>
            ))}
          </div>
        </section>

        <section className="form-section">
          <h2>Your Location</h2>
          <p>
            Enter the location name and select the exact position on the map.
          </p>

          <div className="input-group">
            <FaMapMarkerAlt />
            <input
              type="text"
              name="location"
              placeholder="Example: Anna Nagar, Chennai"
              value={formData.location}
              onChange={handleChange}
            />
          </div>
        </section>

        <section className="form-section">
          <div className="assistance-location-picker-header">
            <div>
              <h2>Select Location on Map</h2>
              <p>Click on the map or use your current location.</p>
            </div>

            <button
              type="button"
              className="assistance-current-location-btn"
              onClick={handleUseCurrentLocation}
              disabled={gettingLocation}
            >
              {gettingLocation ? <FaCrosshairs /> : <FaLocationArrow />}
              {gettingLocation ? "Locating..." : "Use My Current Location"}
            </button>
          </div>

          <div className="assistance-map-picker">
            <MapContainer
              center={DEFAULT_MAP_CENTER}
              zoom={11}
              scrollWheelZoom
              className="assistance-location-map"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapClickHandler onLocationSelect={handleMapLocationSelect} />

              {mapCoordinates && (
                <CircleMarker
                  center={mapCoordinates}
                  radius={10}
                  pathOptions={{
                    color: "#ff7100",
                    fillColor: "#ff7100",
                    fillOpacity: 0.85,
                    weight: 3,
                  }}
                />
              )}
            </MapContainer>
          </div>

          <div
            className={
              mapCoordinates
                ? "assistance-location-selected success"
                : "assistance-location-selected"
            }
          >
            <FaMapMarkerAlt />
            <div>
              <strong>
                {mapCoordinates ? "Location Selected" : "No Map Location Selected"}
              </strong>
              <span>{locationMessage}</span>
              {mapCoordinates && (
                <small>
                  Latitude: {mapCoordinates[0].toFixed(6)} &nbsp;•&nbsp; Longitude: {mapCoordinates[1].toFixed(6)}
                </small>
              )}
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2>Contact Number</h2>
          <div className="input-group">
            <FaPhone />
            <input
              type="tel"
              name="contactNumber"
              placeholder="Enter your contact number"
              value={formData.contactNumber}
              onChange={handleChange}
            />
          </div>
        </section>

        <section className="form-section">
          <h2>Additional Details</h2>
          <textarea
            name="description"
            placeholder="Describe what assistance you need and provide any important details..."
            value={formData.description}
            onChange={handleChange}
            rows="5"
          />
        </section>

        <button type="submit" className="submit-assistance-btn">
          <FaPaperPlane />
          Submit Assistance Request
        </button>
      </form>
    </div>
  );
}

export default RequestAssistance;
