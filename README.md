# 🎓 ProgressHub

### Student Learning & Classroom Management Platform

ProgressHub is a modern educational management platform that helps teachers manage classrooms and enables students to track their academic progress through assignments, quizzes, attendance monitoring, and performance analytics.

Built with **React, TypeScript, Supabase, and PostgreSQL**, the platform provides a secure, role-based environment designed specifically for educational institutions.

---

## 🚀 Project Overview

Traditional classroom management often relies on multiple disconnected tools for attendance, assignments, quizzes, and student progress tracking.

ProgressHub brings everything together into a single platform where:

* Teachers manage classes and student records
* Students access learning resources and track progress
* Attendance is monitored digitally
* Assignments and quizzes are managed centrally
* Academic analytics provide actionable insights

---

## 🎯 Objectives

* Improve communication between teachers and students
* Digitize classroom management workflows
* Track student performance in real-time
* Simplify attendance and assessment management
* Provide meaningful academic analytics

---

# ✨ Features

## 👨‍🏫 Teacher Features

### Classroom Management

* Create and manage classes
* Organize students by class and section
* View student performance metrics

### Student Registry

* Add students individually
* Bulk import students using CSV
* Manage enrollment records

### Assignment Management

* Create assignments
* Attach study materials and files
* Set deadlines
* Track submissions

### Quiz Management

* Create MCQ-based quizzes
* Configure time limits
* Automatic evaluation and scoring
* View quiz statistics

### Attendance Tracking

* Mark attendance daily
* Subject-wise attendance records
* View attendance reports

### Analytics Dashboard

* Class performance overview
* Attendance statistics
* Quiz and assignment analytics

---

## 👨‍🎓 Student Features

### Personal Dashboard

* Academic overview
* Attendance percentage
* Assignment reminders
* Recent activities

### Assignment Center

* View assigned tasks
* Download resources
* Track deadlines

### Quiz Portal

* Attempt quizzes online
* Instant score calculation
* Review quiz history

### Attendance Records

* View attendance history
* Monitor attendance percentage

### Progress Analytics

* Quiz performance trends
* Academic growth tracking
* Attendance insights

---

# 🔐 Authentication & User Management

## Supported Roles

The platform supports only two roles:

### Student

Students can:

* View assignments
* Attempt quizzes
* Track attendance
* Monitor academic progress

### Teacher

Teachers can:

* Manage classes
* Manage students
* Create assignments and quizzes
* Mark attendance
* Access analytics

---

## Registration Flow

### Teacher Registration

Teachers register using:

* Full Name
* Email Address
* Password
* Teacher Invitation Code

The system automatically assigns the **Teacher** role after verification.

### Student Registration

Students cannot freely select a role, class, section, or permissions.

Students register using:

* Full Name
* Email Address
* Roll Number
* Password

The system validates the student against the pre-enrolled student registry before creating the account.

If validation succeeds:

* The account is activated
* The Student role is assigned automatically
* The student is linked to the correct class

---

# 🔒 Security Features

* Role-Based Access Control (RBAC)
* Automatic role assignment
* Protected routes
* Supabase Authentication
* JWT-based sessions
* Row Level Security (RLS)
* Class-level data isolation
* Secure teacher invitation system

---

# 🏗️ System Architecture

Frontend → Service Layer → Supabase Backend

### Frontend

* React 19
* TypeScript
* Vite
* Tailwind CSS
* React Router

### Service Layer

* Authentication Services
* Database Services
* Storage Services
* API Abstraction Layer

### Backend

* Supabase Auth
* PostgreSQL Database
* Storage Buckets
* RLS Policies

---

# 🛠️ Tech Stack

## Frontend

| Technology   | Purpose           |
| ------------ | ----------------- |
| React 19     | User Interface    |
| TypeScript   | Type Safety       |
| Vite         | Build Tool        |
| Tailwind CSS | Styling           |
| React Router | Routing           |
| Recharts     | Analytics         |
| Axios        | API Communication |

## Backend

| Technology       | Purpose          |
| ---------------- | ---------------- |
| Supabase         | Backend Platform |
| PostgreSQL       | Database         |
| Supabase Auth    | Authentication   |
| Supabase Storage | File Management  |

---

# 📊 Core Modules

## Authentication

Secure login and registration system with automatic role assignment.

## Classroom Management

Teacher-controlled class creation and student management.

## Assignments

Create, manage, and distribute assignments with file attachments.

## Quizzes

Timed MCQ assessments with automatic grading.

## Attendance

Daily attendance tracking with reporting capabilities.

## Analytics

Performance monitoring through charts and statistics.

## Notifications

Real-time updates for assignments, quizzes, and important events.

---

# 🚀 Getting Started

## Prerequisites

* Node.js 18+
* npm or yarn
* Supabase Account

---

## Installation

### Clone Repository

```bash
git clone https://github.com/your-username/progresshub.git
cd progresshub
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run Development Server

```bash
npm run dev
```

---

# 📁 Project Structure

```text
src/
├── components/
├── pages/
├── layouts/
├── hooks/
├── services/
├── context/
├── utils/
├── types/
└── assets/
```

---

# 🎯 Future Enhancements

* Parent Portal
* Assignment Submission System
* AI-Based Performance Insights
* Learning Recommendations
* Mobile Application
* Push Notifications
* Academic Reports Export (PDF)

---

# 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request

---

# 📄 License

This project is developed for educational and academic purposes.

---

### Built to make classroom management simpler, smarter, and more accessible.
