# Local Disaster Relief Coordination Platform

A full-stack web-based disaster relief coordination platform designed to connect citizens, volunteers, donors, NGOs, government authorities, and administrators through a centralized system for emergency reporting, assistance coordination, relief camps, donations, operations, and disaster-response monitoring.

---

## 📌 Project Overview

The **Local Disaster Relief Coordination Platform** is a centralized web application developed to improve coordination during disaster and emergency situations.

The platform brings multiple stakeholders together in a single system:

- Citizens can report emergencies and request assistance.
- Volunteers can participate in relief activities and manage assigned tasks.
- Donors can contribute resources and donations.
- NGOs can coordinate relief camps, do contributions, and response activities.
- Government authorities can monitor emergencies, assistance requests, camps, operations, donations, volunteers, NGOs, and relief distribution.
- Administrators provide system-wide monitoring and centralized platform control.

The system combines role-based access control, real-time dashboard information, emergency management, map-based response visualization, relief camp management, assistance coordination, and administrative monitoring.

---

## 🎯 Objectives

The major objectives of the project are:

1. Provide a centralized platform for disaster relief coordination.
2. Allow citizens to report emergencies quickly.
3. Enable citizens to request different types of emergency assistance.
4. Connect volunteers with relief operations.
5. Support donations and resource contributions.
6. Allow NGOs to coordinate relief activities and camps.
7. Provide government authorities with centralized monitoring and management.
8. Provide administrators with system-wide oversight.
9. Display emergency and relief information using map-based interfaces.
10. Improve visibility and coordination of disaster response activities.

---

## 👥 User Roles

The platform supports the following major user roles:

### 👤 Citizen

Citizens can:

- Register and log in.
- Report emergencies.
- Request assistance.
- Share location information.
- View disaster-related information.
- View relief camps.
- Access disaster maps.
- Monitor their submitted requests.

### 🤝 Volunteer

Volunteers can:

- Register as volunteers.
- Access their volunteer dashboard.
- Participate in relief operations.
- View and manage relevant relief activities.

### 💝 Donor

Donors can:

- Access the donation module.
- Contribute donations and resources.
- View donation-related information.

### 🏢 NGO

NGOs can:

- Manage NGO activities.
- Coordinate relief camps.
- Manage contributions.
- Monitor response information.
- Access NGO response maps.

### 🏛️ Government

Government authorities have a centralized management interface for:

- Emergency management
- Assistance requests
- Relief camps
- Relief distribution
- Donations
- NGOs
- Volunteers
- Relief operations
- Reports
- Response maps

### 🛡️ Administrator

The Admin module provides system-wide oversight through an administrative portal.

The Admin portal includes:

- Dashboard
- Command Center
- Emergency Management
- Disaster Map
- Assistance Request Management
- Relief Camp Management
- Operations Management
- NGO Management
- Volunteer Management
- Citizen/User Management
- Relief Distribution
- Donations Management
- Approvals
- Reports & Analytics
- Activity Logs
- Announcements
- System Settings

---

# 🚨 Major Features

## Emergency Reporting

Citizens can submit emergency reports through the emergency reporting interface.

Emergency information can be monitored and managed through government and administrative modules.

---

## 🆘 Assistance Requests

Citizens can submit requests for assistance.

The platform provides management interfaces for monitoring and processing assistance requests.

---

## 🗺️ Disaster Maps

The application provides map-based disaster-response interfaces.

Location information can be used to visualize:

- Emergency reports
- Assistance-related locations
- Relief camps
- Response information

Map functionality is available across relevant Citizen, Government, NGO, and Admin interfaces.

---

## ⛺ Relief Camp Management

The platform supports relief camp management.

Relief camps can be created and monitored with location and capacity-related information.

Camp information is integrated into response maps so that relevant users can identify available relief infrastructure.

---

## 🤝 Volunteer Management

The platform supports volunteer registration and volunteer-related relief activities.

Government and administrative modules provide monitoring capabilities for volunteer participation.

---

## 🏢 NGO Management

NGOs are integrated into the disaster-response workflow.

The platform supports NGO-related activities, contributions, camps, and response monitoring.

---

## 💰 Donations Management

The platform provides donation functionality for disaster relief.

Donations can be monitored through donor, government, and administrative interfaces.

---

## 📦 Relief Distribution

Relief distribution is incorporated into the platform to support coordination of relief resources and their distribution during disaster-response activities.

---

## ⚙️ Operations Management

Relief operations can be created and monitored as part of the overall disaster-response workflow.

Government and administrative modules provide centralized visibility into active operations.

---

## 📊 Dashboards

The application provides dashboard interfaces for different roles.

The administrative dashboard provides system-wide information including:

- Active emergencies
- Assistance requests
- Relief operations
- Relief camps
- Other response information

---

## 🛡️ Admin Command Center

The Admin Command Center provides centralized administrative monitoring.

It provides:

- Priority response queue
- Active emergency monitoring
- Assistance monitoring
- Relief camp monitoring
- Operation monitoring
- Response statistics
- Quick access to management modules
- System-wide administrative oversight

---

# 🏗️ Technology Stack

## Frontend

- React.js
- Vite
- React Router
- Bootstrap
- Axios
- React Icons
- Leaflet / map-based interfaces
- CSS

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT-based authentication
- bcrypt-based password protection
- CORS
- dotenv

## Development Tools

- Visual Studio Code
- Git
- GitHub
- npm

---

# 🏛️ System Architecture

The application follows a client-server architecture.

```text
                    ┌─────────────────────────┐
                    │       Users             │
                    │                         │
                    │ Citizen / Volunteer     │
                    │ Donor / NGO             │
                    │ Government / Admin      │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │     React Frontend      │
                    │                         │
                    │ Pages / Components       │
                    │ Dashboards / Maps        │
                    │ Authentication           │
                    └────────────┬────────────┘
                                 │
                                 │ HTTP / REST API
                                 ▼
                    ┌─────────────────────────┐
                    │    Node.js + Express    │
                    │                         │
                    │ Routes                   │
                    │ Controllers              │
                    │ Middleware               │
                    │ Authentication           │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │        MongoDB           │
                    │                         │
                    │ Users                    │
                    │ Emergencies              │
                    │ Assistance Requests      │
                    │ Donations                │
                    │ Relief Camps             │
                    │ Operations               │
                    │ Distribution              │
                    │ Activity Logs            │
                    │ Announcements            │
                    │ System Settings          │
                    └─────────────────────────┘