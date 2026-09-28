# ReliefConnect — Local Disaster Relief Coordination Platform

A full-stack web platform for coordinating disaster-response activities across citizens, volunteers, donors, NGOs, government authorities, and system administrators.

## Overview

ReliefConnect provides a centralized platform for reporting emergencies, requesting assistance, coordinating relief camps and operations, managing donations and distributions, and monitoring disaster-response activity.

## Core Objectives

- Provide citizens with a way to report emergencies and request assistance.
- Help volunteers participate in relief activities.
- Enable donors to contribute resources.
- Allow NGOs to manage relief contributions and camps.
- Provide government authorities with operational monitoring and coordination tools.
- Provide administrators with system-wide monitoring and control.
- Support location-based disaster and relief-camp visualization.
- Centralize emergency, assistance, operation, donation, and distribution information.

## Main User Roles

| Role | Main Responsibility |
|---|---|
| Citizen | Report emergencies, request assistance, and view disaster information |
| Volunteer | Participate in relief operations and response activities |
| Donor | Contribute donations and resources |
| NGO | Coordinate NGO activities, camps, and contributions |
| Government | Monitor and coordinate disaster-response operations |
| Admin | System-wide command, monitoring, management, approvals, analytics, and oversight |

## Major Modules

### Citizen Portal
- Citizen dashboard
- Emergency reporting
- Assistance requests
- Disaster map
- Relief-camp information
- Location-based response information

### Volunteer Portal
- Volunteer dashboard
- Relief-operation participation
- Response activity management

### Donor Portal
- Donation management
- Contribution information
- Donation-related activity

### NGO Portal
- NGO dashboard
- Relief camps
- NGO contributions
- Response map
- NGO coordination activities

### Government Portal
- Government dashboard
- Emergency management
- Assistance management
- Relief camps
- Operations
- NGOs
- Volunteers
- Donations
- Distribution
- Reports
- Response map

### Admin Portal
The Admin Portal acts as the central command and monitoring authority of the platform.

Administrative sections include:
- Dashboard
- Command Center
- Disaster Map
- Emergencies
- Assistance Requests
- Relief Camps
- Operations
- NGOs
- Volunteers
- Citizens / Users
- Donations
- Distribution
- Approvals
- Reports & Analytics
- Announcements
- Activity Logs
- System Settings

## Technology Stack

### Frontend
- React
- Vite
- React Router
- Axios
- CSS / Bootstrap
- React Icons
- Leaflet

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- Role-based authorization

### Development Tools
- Git
- GitHub
- npm
- VS Code

## Project Structure

```text
Disaster-Relief-System/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── package.json
│   └── .gitignore
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── styles/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Application Architecture

```text
                         ReliefConnect
                              │
                ┌─────────────┴─────────────┐
                │                           │
             Frontend                    Backend
              React                     Node/Express
                │                           │
        ┌───────┼────────┐          ┌───────┼────────┐
        │       │        │          │       │        │
      Portals  Maps   Services    Routes  Controllers Models
        │       │        │          │       │        │
        └───────┴────────┘          └───────┴────────┘
                                            │
                                         MongoDB
```

## Authentication and Authorization

The application uses role-based access control.

Authentication is handled through backend authentication routes and controllers. Protected frontend routes restrict access to role-specific portals.

Backend middleware is used for authentication and role authorization.

Supported roles include:

```text
citizen
volunteer
donor
ngo
government
admin
```

## Backend Organization

The backend is organized into:

- `controllers/` — application and business logic
- `models/` — MongoDB/Mongoose schemas
- `routes/` — API route definitions
- `middleware/` — authentication and authorization
- `config/` — database configuration

Major route groups include:

```text
/auth
/admin
/dashboard
/assistance
/emergency
/government
/ngo
/relief-camp
/volunteer
/donor
```

## Data Models

The backend contains models for major platform entities, including:

- User
- Emergency
- Assistance
- ReliefCamp
- GovernmentOperation
- Donation
- ReliefDistribution
- NGOContribution
- ActivityLog
- Announcement
- SystemSetting

## Local Development Setup

### Prerequisites

Install:

- Node.js
- npm
- MongoDB or MongoDB Atlas
- Git

### Clone the Repository

```bash
git clone <your-github-repository-url>
cd Disaster-Relief-System
```

### Backend

```bash
cd backend
npm install
```

Create `backend/.env` and configure the environment variables required by the application.

Example:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5001
```

Never commit `.env` or other secrets.

Start the backend:

```bash
npm start
```

For development, if available:

```bash
npm run dev
```

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite will display the local development URL.

## Environment and Security

Do not commit:

```text
.env
node_modules/
dist/
.DS_Store
```

Never publish database credentials, JWT secrets, API keys, passwords, or other private configuration.

## Git Workflow

Check the working tree:

```bash
git status
```

Stage changes:

```bash
git add .
```

Review:

```bash
git diff --cached --stat
git diff --cached --check
```

Commit:

```bash
git commit -m "Describe the change"
```

Push:

```bash
git push origin main
```

## Project Status

The project contains role-based portals for:

- Citizen
- Volunteer
- Donor
- NGO
- Government
- Admin

The Admin Portal provides centralized system-wide monitoring and management capabilities, while the Government Portal focuses on government-level disaster-response operations.

## Production Considerations

For production deployment, additional work would be recommended, including:

- secure production secret management
- database security and backups
- comprehensive input validation
- rate limiting
- security auditing
- production logging and monitoring
- automated testing
- CI/CD
- deployment-specific environment configuration

## Author

**Deewakar Mandal**

B.Tech — Information Technology

## License

This project is developed for academic and portfolio purposes.