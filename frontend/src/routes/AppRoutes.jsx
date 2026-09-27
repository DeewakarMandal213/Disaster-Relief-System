import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";

import Citizen from "../pages/Citizen/Citizen";
import ReportEmergency from "../pages/Citizen/ReportEmergency";
import RequestAssistance from "../pages/Citizen/RequestAssistance";

import Volunteer from "../pages/Volunteer/Volunteer";
import VolunteerDashboard from "../pages/Volunteer/VolunteerDashboard";
import Donor from "../pages/Donor/Donor";
import NGO from "../pages/NGO/NGO";
import Government from "../pages/Government/Government";
import GovernmentEmergencies from "../pages/Government/GovernmentEmergencies";
import GovernmentAssistance from "../pages/Government/GovernmentAssistance";
import Admin from "../pages/Admin/Admin";
import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/citizen" element={<Citizen />} />
      <Route path="/citizen/report-emergency" element={<ReportEmergency />} />
      <Route path="/citizen/request-assistance" element={<RequestAssistance />} />

      <Route path="/volunteer" element={<Volunteer />} />
      <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} />
      <Route path="/donor" element={<Donor />} />
      <Route path="/ngo" element={<NGO />} />

      <Route path="/government" element={<Government />} />
      <Route path="/government/emergencies" element={<GovernmentEmergencies />} />
      <Route path="/government/assistance" element={<GovernmentAssistance />} />
      <Route path="/government/assistance-requests" element={<GovernmentAssistance />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <Admin />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
