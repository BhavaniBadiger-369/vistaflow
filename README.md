VistaFlow

VistaFlow is a full-stack web application for managing internal teams, projects, and tasks within an organization.

It is built with a clear separation between frontend and backend, focusing on secure access, structured workflows, and role-based functionality. The goal was to design something close to a real internal tool rather than just a demo application.

Project Overview

The application models work using a simple hierarchy:

Projects → Sections → Tasks
Role-based access for ADMIN, MANAGER, and MEMBER
Dedicated dashboards for each role
Shared features like search, filtering, pagination, and export

The codebase is organized into:

client/ → Next.js frontend
server/ → Express API with Prisma
shared/ → shared types and enums
Features
Core Features
User authentication (register, login, logout, refresh, current user)
JWT authentication using HttpOnly cookies
Role-based authorization enforced in both backend APIs and frontend UI
CRUD operations for Projects, Sections, and Tasks
Hierarchical project structure (Projects → Sections → Tasks)
Role-specific dashboards:
ADMIN → overall platform stats and activity
MANAGER → team overview and project tracking
MEMBER → personal task list and status tracking
Global search across projects and tasks
Task filtering (status, priority, assignee, date range, project)
CSV and Excel export of filtered task data
Pagination for users, projects, tasks, and activity logs
Bonus Features
Soft delete using deletedAt instead of permanent deletion
Activity logging for important actions
Responsive UI with dark mode support
Rate limiting on authentication routes
Tech Stack
Frontend
Next.js (App Router)
TypeScript
Tailwind CSS
Zustand
React Hook Form + Zod
Axios
Sonner
Lucide React
Backend
Node.js
Express
TypeScript
Prisma ORM
MySQL
Zod validation
bcryptjs
jsonwebtoken
express-rate-limit
json2csv
xlsx
Why MySQL Was Chosen

The application uses a strongly relational data model:

Users → Projects → Sections → Tasks
Tasks linked to assignees and creators
Activity logs connected to multiple entities

MySQL works well for this because it provides:

structured schema with relationships
foreign key constraints for data integrity
efficient querying and filtering

Prisma was used to simplify schema management and database operations.

Architecture Decision

The frontend and backend are separated instead of using Next.js API routes.

Next.js handles UI and routing
Express handles APIs and business logic

This separation keeps:

authentication and authorization centralized
database access consistent
frontend independent from backend logic

It also makes the application easier to scale and maintain.

Technical Challenge

One challenge was ensuring role-based access worked consistently across all features.

It’s easy to protect routes but still expose data through:

dashboards
search
export endpoints

To avoid this, access control was handled in the service layer so that:

all queries respect user permissions
the same rules apply across listing, search, and export
Setup Instructions

👉 Refer to the setup guide for detailed steps.

Demo Credentials

Use the following accounts to test different roles:

ADMIN
admin@vistaflow.com
 / Admin@123

MANAGER
manager@vistaflow.com
 / Manager@123

MEMBER
member@vistaflow.com
 / Member@123

Additional user:
analyst@vistaflow.com
 / Analyst@123

API Surface

Main API modules:

auth
users
projects
sections
tasks
dashboard
export
search
activity

Key endpoints include:

POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
POST /api/auth/refresh
GET /api/users
GET /api/users/:id
PATCH /api/users/:id
POST /api/projects
GET /api/projects
PATCH /api/projects/:id
DELETE /api/projects/:id
POST /api/tasks
GET /api/tasks
PATCH /api/tasks/:id
DELETE /api/tasks/:id
GET /api/dashboard/admin
GET /api/dashboard/manager
GET /api/dashboard/member
GET /api/export/tasks.csv
GET /api/export/tasks.xlsx
GET /api/search?q=...
GET /api/activity

Future Improvements
Real-time updates using WebSockets
Improved user management (invite, reset password)
Activity timeline UI
Query caching and performance optimization
Automated test coverage
Build Verification

