import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Citizen from "../pages/Citizen/Citizen";
import Volunteer from "../pages/Volunteer/Volunteer";
import Donor from "../pages/Donor/Donor";
import NGO from "../pages/NGO/NGO";
import Government from "../pages/Government/Government";
import Admin from "../pages/Admin/Admin";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/citizen" element={<Citizen />} />
      <Route path="/volunteer" element={<Volunteer />} />
      <Route path="/donor" element={<Donor />} />
      <Route path="/ngo" element={<NGO />} />
      <Route path="/government" element={<Government />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}

export default AppRoutes;