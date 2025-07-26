# CivicEye

**CivicEye** is a full-stack web application designed to empower citizens and police with tools for emergency reporting, case tracking, public safety education, and crime data visualization. The platform provides a modern, user-friendly interface for both the public and police administrators, with a robust backend for data management and analytics.

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Frontend Overview](#frontend-overview)
- [Backend Overview](#backend-overview)
- [Setup & Installation](#setup--installation)
- [Usage](#usage)
- [Data Sources](#data-sources)
- [Credits](#credits)
- [License](#license)

---

## Features

- **Emergency Reporting:** Citizens can file FIRs (First Information Reports) with evidence uploads.
- **Case Tracking:** Users can track the status of their reports using a unique tracking number.
- **Admin Panel:** Police/admins can manage FIRs, users, officers, logs, analytics, and system settings.
- **Crime Data Dashboard:** Visualize crime trends, compare cities, and explore stories and references.
- **Safety Tips & Help Guide:** Public resources for safety and platform usage.
- **Responsive Design:** Usable on desktop and mobile devices.

---

## Project Structure

```
CivicEye/
├── Backend/
│   ├── config/           # Database and email configuration
│   ├── controllers/      # Express controllers for reports, users, auth, police
│   ├── models/           # Mongoose models: Report, User, Police
│   ├── routes/           # Express routes: report, user, auth, police
│   ├── uploads/          # Uploaded evidence files
│   ├── server.js         # Main Express server
│   └── testMail.js       # Email test script
├── Frontend/
│   ├── Admin/            # Admin panel (admin.html, admin.css, script.js)
│   ├── landing/          # Main landing page and login
│   ├── report/           # Report case UI
│   ├── Track_case/       # Case tracking UI
│   ├── safety-tips/      # Safety tips page
│   ├── Emergency/        # Emergency contacts page
│   ├── help_guide/       # Help and documentation
│   ├── Dashboard/        # Data dashboard, stories, references, about, data
│   └── Assets/           # Images and icons
└── README.md             # (You are here)
```

---

## Frontend Overview

- **Landing Page:** `/Frontend/landing/index.html` — Entry point for users.
- **Admin Panel:** `/Frontend/Admin/admin.html` — For police/admins to manage the system.
- **Report Case:** `/Frontend/report/report.html` — Citizens file FIRs with evidence.
- **Track Case:** `/Frontend/Track_case/track.html` — Track FIR status.
- **Safety Tips:** `/Frontend/safety-tips/safety.html` — Public safety information.
- **Emergency Contacts:** `/Frontend/Emergency/emergency.html` — Quick access to emergency numbers.
- **Help Guide:** `/Frontend/help_guide/help.html` — How-to and FAQ.
- **Dashboard:** `/Frontend/Dashboard/` — Crime data, stories, references, and about.

### Technologies

- HTML5, CSS3, JavaScript (Vanilla)
- Responsive design, modern UI/UX
- FontAwesome, Lucide icons

---

## Backend Overview

- **Express.js** server (`Backend/server.js`)
- **MongoDB** via Mongoose for data storage
- **RESTful API** for reports, users, police, and authentication
- **File uploads** for evidence (Multer)
- **Email notifications** for new FIRs

### Key Endpoints

- `/api/reports` — Submit and manage FIRs
- `/api/users` — User management
- `/api/police` — Police/officer management
- `/api/auth` — Authentication (login/register)

### Models

- **Report:** FIR details, evidence, status, assigned officer, timestamps
- **User:** Name, age, contact, email, password
- **Police:** Officer details

---

## Setup & Installation

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)

### Backend

```bash
cd Backend
npm install
# Configure MongoDB in config/db.js if needed
node server.js
```

### Frontend

- Open `Frontend/landing/index.html` in your browser for the public interface.
- Open `Frontend/Admin/admin.html` for the admin panel.

> No build step is required for the frontend; it is pure HTML/CSS/JS.

---

## Usage

- **Citizens:** File and track reports, access safety tips, and emergency contacts.
- **Police/Admin:** Log in to the admin panel to manage FIRs, users, officers, view analytics, and system logs.
- **Dashboard:** Explore crime data, stories, and references.

---

## Data Sources

- Crime data sourced from the [National Crime Records Bureau (NCRB), India](http://ncrb.gov.in).
- Data visualizations and stories are based on NCRB reports .

---



---

## License

This project is for educational and civic use. See individual files for third-party licenses.

---

**For more details, contact the app owner and team.vigneshgaddam100@gmail.com** 