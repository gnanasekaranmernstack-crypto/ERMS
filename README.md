# College Exam Notifier & Result Management System

A production-ready MERN stack application with a modern, mobile-first UI for managing college exams and results.

## Tech Stack
- **Frontend**: React + Vite, TailwindCSS, Framer Motion, Recharts, Axios, React Hot Toast
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs
- **Architecture**: MVC, ES Modules, Protected Routes, Centralized Error Handling

## Features
- **Dashboard**: Stats cards, Upcoming exams list, Department pie chart, Monthly exam bar chart.
- **Exams**: Full CRUD with subject, hall number, status (auto-updated), search, and filters.
- **Results**: Full CRUD with student info, marks, grades, and automatic CGPA/GPA calculation.
- **Auth**: Secure JWT-based login for admin users.
- **Mobile First**: Fully responsive design with collapsible sidebar and touch-friendly UI.

## Installation & Setup

### 1. Prerequisites
- Node.js installed
- MongoDB installed and running locally

### 2. Quick Start (Root Directory)
```bash
npm install
npm run dev
```
This will start both the backend (with nodemon) and the frontend (Vite) concurrently.

### 3. Individual Setup

#### Backend Setup
```bash
cd backend
npm install
npm run dev    # Starts with nodemon
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev    # Starts Vite server
```

## Admin Credentials
- **Email**: admin@gmail.com (configurable in backend/.env)
- **Password**: admin123 (configurable in backend/.env)

## Folder Structure
- `backend/`: Backend MVC structure
- `frontend/`: React + Vite frontend structure
