
# School Vaccination Portal

A full-stack web application built for managing school vaccination drives, enabling coordinators to handle student records, schedule vaccinations, track status, and generate reports.

## 📌 Table of Contents

- Features
- Architecture
- Tech Stack
- Setup Instructions
- API Endpoints
- Database Models
- Assumptions
- License

---

## ✅ Features

### Authentication & Access
- Simulated login (no real authentication).
- Admin-only role: school coordinator.

### Dashboard Overview
- Total students, vaccinated %.
- Upcoming vaccination drives (next 30 days).
- Graceful empty states when no drives are scheduled.

### Student Management
- Add/edit students individually.
- Bulk import via CSV.
- Search by name, class, ID, or vaccination status.
- Mark student vaccinated (per drive and vaccine, only once per vaccine).

### Vaccination Drive Management
- Create drives with vaccine name, date, class eligibility.
- Prevent overlaps and enforce 15-day minimum scheduling.
- Disable editing for past drives.

### Reporting
- Generate vaccination reports with filters.
- Export to CSV/Excel/PDF.
- Pagination supported.

---

## 🏗️ Architecture

```
Frontend (React)
    |
    |— Axios/API Calls
    v
Backend (Express + Node.js)
    |
    |— REST APIs
    v
MongoDB Database (Mongoose ODM)
```

---

## ⚙️ Tech Stack

- **Frontend**: React.js, React Router, Axios, Bootstrap
- **Backend**: Node.js, Express.js
- **Database**: MongoDB + Mongoose
- **Others**: CSV Parser, dotenv, Nodemon

---

## 🚀 Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/school-vaccination-portal.git
cd school-vaccination-portal
```

### 2. Backend Setup

```bash
cd school-vaccination-backend
npm install
cp .env.example .env # Provide your MongoDB URI and port
npm start
```

### 3. Frontend Setup

```bash
cd ../school-vaccination-frontend
npm install
npm start
```

Frontend should now be running at `http://localhost:3000`, and backend at `http://localhost:5000`.

---

## 📡 API Endpoints

### Student APIs

- `POST /api/students` – Add student
- `GET /api/students` – Fetch all students (with filters)
- `PUT /api/students/:id` – Edit student
- `POST /api/students/import` – CSV bulk import
- `PUT /api/students/:id/vaccinate` – Mark student vaccinated

### Drive APIs

- `POST /api/drives` – Create vaccination drive
- `GET /api/drives` – Get all drives
- `PUT /api/drives/:id` – Edit upcoming drive
- `GET /api/drives/upcoming` – Drives in next 30 days

### Dashboard APIs

- `GET /api/dashboard/metrics` – Aggregated stats: total students, vaccinated %, etc.

### Report APIs

- `GET /api/reports?filter=xyz` – Filtered student vaccination reports
- `GET /api/reports/export` – Download report

---

## 🧠 Database Models

### Student

```js
{
  name: String,
  class: String,
  id: String,
  vaccinations: [
    {
      driveId: ObjectId,
      vaccine: String,
      date: Date,
      status: "vaccinated"
    }
  ]
}
```

### Drive

```js
{
  vaccine: String,
  date: Date,
  eligibleClasses: [String],
  slots: Number,
  createdBy: String
}
```

---


## 📓 Assumptions

- Admin role is assumed via hardcoded login.
- Drives can only be edited before their scheduled date.
- One student cannot be vaccinated twice for the same vaccine.
- Only upcoming drives (next 30 days) are considered in the dashboard.

---

## 📜 License

This project is developed for academic purposes for the SE ZG503 FSAD II SEM course.
