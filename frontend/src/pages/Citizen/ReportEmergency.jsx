import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";

import {
  FaArrowLeft,
  FaExclamationTriangle,
  FaFire,
  FaWater,
  FaHouseDamage,
  FaMapMarkerAlt,
  FaPhone,
  FaPaperPlane,
  FaCrosshairs,
  FaLocationArrow,
} from "react-icons/fa";

import API from "../../services/api";

import "leaflet/dist/leaflet.css";
import "./ReportEmergency.css";


/*
 * Fix Leaflet marker icons when using Vite.
 */
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});


/*
 * Default map center: Chennai.
 *
 * This is only the initial map view.
 * It does NOT access the user's location.
 */
const DEFAULT_MAP_CENTER = [
  13.0827,
  80.2707,
];


/*
 * Handles clicks on the map.
 */
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(event) {
      onLocationSelect([
        event.latlng.lat,
        event.latlng.lng,
      ]);
    },
  });

  return null;
}


function ReportEmergency() {
  const navigate = useNavigate();

  const [emergencyType, setEmergencyType] =
    useState("");

  const [severity, setSeverity] =
    useState("Medium");

  const [formData, setFormData] = useState({
    location: "",
    contactNumber: "",
    description: "",
  });

  const [mapCoordinates, setMapCoordinates] =
    useState(null);

  const [gettingLocation, setGettingLocation] =
    useState(false);

  const [locationMessage, setLocationMessage] =
    useState("Click on the map to select an emergency location.");


  const emergencyTypes = [
    {
      name: "Flood",
      icon: <FaWater />,
    },
    {
      name: "Fire",
      icon: <FaFire />,
    },
    {
      name: "Building Damage",
      icon: <FaHouseDamage />,
    },
    {
      name: "Other Emergency",
      icon: <FaExclamationTriangle />,
    },
  ];


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  /*
   * Select a location by clicking on the map.
   */
  const handleMapLocationSelect = (coordinates) => {
    setMapCoordinates(coordinates);

    setLocationMessage(
      "Emergency location selected successfully."
    );
  };


  /*
   * Get the browser's current location.
   */
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage(
        "Geolocation is not supported by this browser."
      );

      return;
    }

    setGettingLocation(true);

    setLocationMessage(
      "Getting your current location..."
    );

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = [
          position.coords.latitude,
          position.coords.longitude,
        ];

        setMapCoordinates(coordinates);

        setLocationMessage(
          "Your current location has been selected."
        );

        setGettingLocation(false);
      },

      (error) => {
        console.error(
          "Location permission error:",
          error
        );

        setLocationMessage(
          "Unable to access your current location. You can still select a location directly on the map."
        );

        setGettingLocation(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emergencyType) {
      alert(
        "Please select an emergency type."
      );

      return;
    }

    if (!formData.location.trim()) {
      alert(
        "Please enter the emergency location."
      );

      return;
    }

    /*
     * Coordinates are recommended because they allow
     * the emergency to appear on the Disaster Map.
     */
    if (!mapCoordinates) {
      const shouldContinue = window.confirm(
        "You have not selected a location on the map. The emergency can still be submitted, but it will not appear as a map marker. Do you want to continue?"
      );

      if (!shouldContinue) {
        return;
      }
    }


    try {
      const response = await API.post(
        "/emergencies",
        {
          emergencyType,
          severity,

          location:
            formData.location,

          latitude:
            mapCoordinates
              ? mapCoordinates[0]
              : null,

          longitude:
            mapCoordinates
              ? mapCoordinates[1]
              : null,

          contactNumber:
            formData.contactNumber,

          description:
            formData.description,
        }
      );


      console.log(
        "Emergency report created:",
        response.data
      );


      alert(
        "Emergency report submitted successfully."
      );


      navigate("/citizen");

    } catch (error) {
      console.error(
        "Emergency submission failed:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to submit emergency report. Please try again."
      );
    }
  };


  return (
    <div className="report-emergency-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="report-emergency-header">

        <button
          className="back-button"
          onClick={() =>
            navigate("/citizen")
          }
        >
          <FaArrowLeft />
          Back to Dashboard
        </button>


        <div className="emergency-page-title">

          <div className="emergency-title-icon">
            <FaExclamationTriangle />
          </div>


          <div>

            <p>
              EMERGENCY REPORTING
            </p>

            <h1>
              Report an Emergency
            </h1>

          </div>

        </div>

      </div>


      {/* =====================================================
          WARNING
      ===================================================== */}

      <div className="emergency-warning">

        <FaExclamationTriangle />

        <div>

          <strong>
            For immediate life-threatening emergencies
          </strong>

          <p>
            Please contact your local emergency
            services immediately. Use this form
            to report disaster-related emergencies
            to ReliefConnect.
          </p>

        </div>

      </div>


      {/* =====================================================
          FORM
      ===================================================== */}

      <form
        className="emergency-form-card"
        onSubmit={handleSubmit}
      >

        {/* ===================================================
            EMERGENCY TYPE
        =================================================== */}

        <section className="form-section">

          <h2>
            What type of emergency is this?
          </h2>

          <p>
            Select the situation that best
            describes the emergency.
          </p>


          <div className="emergency-types">

            {emergencyTypes.map(
              (type) => (

                <button
                  type="button"
                  key={type.name}
                  className={
                    emergencyType ===
                    type.name
                      ? "emergency-type-card selected"
                      : "emergency-type-card"
                  }
                  onClick={() =>
                    setEmergencyType(
                      type.name
                    )
                  }
                >

                  <span>
                    {type.icon}
                  </span>

                  <strong>
                    {type.name}
                  </strong>

                </button>

              )
            )}

          </div>

        </section>


        {/* ===================================================
            SEVERITY
        =================================================== */}

        <section className="form-section">

          <h2>
            Severity Level
          </h2>


          <div className="severity-options">

            {[
              "Low",
              "Medium",
              "High",
              "Critical",
            ].map(
              (level) => (

                <button
                  type="button"
                  key={level}
                  className={
                    severity ===
                    level
                      ? `severity-btn active ${level.toLowerCase()}`
                      : `severity-btn ${level.toLowerCase()}`
                  }
                  onClick={() =>
                    setSeverity(level)
                  }
                >
                  {level}
                </button>

              )
            )}

          </div>

        </section>


        {/* ===================================================
            LOCATION NAME
        =================================================== */}

        <section className="form-section">

          <h2>
            Emergency Location
          </h2>

          <p>
            Enter the location name and select
            the exact position on the map below.
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


        {/* ===================================================
            LOCATION MAP
        =================================================== */}

        <section className="form-section">

          <div className="location-picker-header">

            <div>

              <h2>
                Select Location on Map
              </h2>

              <p>
                Click anywhere on the map to
                place the emergency marker.
              </p>

            </div>


            <button
              type="button"
              className="current-location-btn"
              onClick={
                handleUseCurrentLocation
              }
              disabled={gettingLocation}
            >

              {gettingLocation ? (
                <FaCrosshairs />
              ) : (
                <FaLocationArrow />
              )}

              {gettingLocation
                ? "Locating..."
                : "Use My Current Location"}

            </button>

          </div>


          <div className="emergency-map-picker">

            <MapContainer
              center={DEFAULT_MAP_CENTER}
              zoom={11}
              scrollWheelZoom={true}
              className="emergency-location-map"
            >

              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />


              <MapClickHandler
                onLocationSelect={
                  handleMapLocationSelect
                }
              />


              {mapCoordinates && (

                <Marker
                  position={
                    mapCoordinates
                  }
                />

              )}

            </MapContainer>

          </div>


          <div
            className={
              mapCoordinates
                ? "location-selected-box success"
                : "location-selected-box"
            }
          >

            <FaMapMarkerAlt />

            <div>

              <strong>
                {mapCoordinates
                  ? "Location Selected"
                  : "No Map Location Selected"}
              </strong>

              <span>
                {locationMessage}
              </span>


              {mapCoordinates && (

                <small>

                  Latitude:{" "}
                  {mapCoordinates[0].toFixed(6)}

                  {"  •  "}

                  Longitude:{" "}
                  {mapCoordinates[1].toFixed(6)}

                </small>

              )}

            </div>

          </div>

        </section>


        {/* ===================================================
            CONTACT
        =================================================== */}

        <section className="form-section">

          <h2>
            Contact Number
          </h2>


          <div className="input-group">

            <FaPhone />

            <input
              type="tel"
              name="contactNumber"
              placeholder="Enter your contact number"
              value={
                formData.contactNumber
              }
              onChange={handleChange}
            />

          </div>

        </section>


        {/* ===================================================
            DESCRIPTION
        =================================================== */}

        <section className="form-section">

          <h2>
            Describe the Emergency
          </h2>


          <textarea
            name="description"
            placeholder="Provide important details about the emergency..."
            value={
              formData.description
            }
            onChange={handleChange}
            rows="5"
          />

        </section>


        {/* ===================================================
            SUBMIT
        =================================================== */}

        <button
          type="submit"
          className="submit-emergency-btn"
        >

          <FaPaperPlane />

          Submit Emergency Report

        </button>

      </form>

    </div>
  );
}

export default ReportEmergency;