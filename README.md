# VistaFlow

A full-stack internal team and project management tool with role-based dashboards, task workflows, and data export.

Built to demonstrate a production-style application with real authentication, authorization, and structured data relationships — not just a CRUD demo.

---

## Live Demo

> Coming soon — currently running locally

**Demo credentials you can use to explore different roles:**

| Role | Email | Password |
|---|---|---|
| Admin | admin@vistaflow.com | Admin@123 |
| Manager | manager@vistaflow.com | Manager@123 |
| Member | member@vistaflow.com | Member@123 |

---

## What It Does

VistaFlow models how a real organization manages work:

- **Projects** contain **Sections**, which contain **Tasks**
- Each user has a role — Admin, Manager, or Member
- Each role sees a different dashboard with relevant data only
- Tasks can be filtered, searched, and exported to CSV or Excel

---

## Features

**Core**
- User registration, login, logout, and session refresh
- JWT authentication stored in HttpOnly cookies (not localStorage)
- Role-based access: Admin, Manager, Member
- Full CRUD for Projects, Sections, and Tasks
- Role-specific dashboards:
  - Admin → platform-wide stats and activity
  - Manager → team overview and project tracking
  - Member → personal task list and status
- Global search across projects and tasks
- Task filtering by status, priority, assignee, date range, and project
- Export filtered tasks as CSV or Excel
- Pagination on all list views

**Bonus**
- Soft delete (records are marked deleted, not permanently removed)
- Activity logging for key user actions
- Dark mode support
- Rate limiting on authentication routes

---

## Tech Stack

**Frontend**
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Zustand (state management)
- React Hook Form + Zod (form handling and validation)
- Axios

**Backend**
- Node.js + Express
- TypeScript
- Prisma ORM
- MySQL
- Zod (server-side validation)
- bcryptjs (password hashing)
- jsonwebtoken (JWT)
- express-rate-limit
- json2csv + xlsx (export)

---

## Why These Choices

**Why MySQL over MongoDB?**
The data model is strongly relational — Users create Tasks assigned to other Users inside Sections inside Projects, with Activity logs linked to multiple entities. MySQL with foreign key constraints was the right fit for this kind of structured, relational data.

**Why Prisma?**
Prisma gives type-safe database access in TypeScript, makes schema changes manageable through migrations, and reduces raw SQL errors.

**Why separate frontend and backend instead of Next.js API routes?**
Keeping Express as a dedicated API server means authentication and authorization logic stays centralized in one place, database access is consistent, and the frontend can be developed and deployed independently.

**Why HttpOnly cookies for JWT?**
Storing tokens in HttpOnly cookies prevents JavaScript from accessing them, which protects against XSS attacks. This is the secure approach compared to storing JWTs in localStorage.

---

## Project Structure

```
VistaFlow/
├── client/          # Next.js frontend (App Router, TypeScript, Tailwind)
├── server/          # Express API (TypeScript, Prisma, MySQL)
└── shared/          # Shared TypeScript types and enums
```

---

## API Overview

**Auth**
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/refresh
```

**Users / Projects / Tasks**
```
GET    /api/users
GET    /api/projects
POST   /api/projects
PATCH  /api/projects/:id
DELETE /api/projects/:id
GET    /api/tasks
POST   /api/tasks
PATCH  /api/tasks/:id
DELETE /api/tasks/:id
```

**Dashboards / Export / Search**
```
GET    /api/dashboard/admin
GET    /api/dashboard/manager
GET    /api/dashboard/member
GET    /api/export/tasks.csv
GET    /api/export/tasks.xlsx
GET    /api/search?q=...
GET    /api/activity
```

---

## Setup

> Detailed setup guide coming soon.

**Requirements:** Node.js, MySQL, npm

```bash
# Install frontend dependencies
cd client && npm install

# Install backend dependencies
cd server && npm install

# Configure environment variables
# Create .env in server/ with your MySQL connection string and JWT secret

# Run database migrations
npx prisma migrate dev

# Start backend
cd server && npm run dev

# Start frontend
cd client && npm run dev
```

---

## Future Improvements

- Deploy with live demo link
- Real-time task updates using WebSockets
- User invite and password reset flow
- Activity timeline UI
- Automated test coverage
- Query caching for performance

---

## Author

**Bhavani Badiger** — Software Developer 
[GitHub](https://github.com/BhavaniBadiger-369) · [LinkedIn](https://www.linkedin.com/in/bhavani-laxmikant-badiger-7a0902267/)
