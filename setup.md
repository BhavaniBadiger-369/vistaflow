VistaFlow Setup

Application URLs

Frontend: http://localhost:3001

Backend API: http://localhost:5000

Health Check: http://localhost:5000/api/health

Prerequisites

Make sure the following are installed on your system:

Node.js (v20 or above)
npm
MySQL (running locally)
MySQL CLI (mysql command available in terminal)
Environment Configuration

This project uses environment variables for configuration. No credentials are hardcoded.

Backend (server/.env)

Update the database connection string based on your local MySQL setup:

DATABASE_URL="mysql://<username>:<password>@localhost:<port>/vistaflow"

Example:

DATABASE_URL="mysql://root:password@localhost:3306/vistaflow"

Other required variables:

PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3001

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

COOKIE_NAME=vistaflow_token

Frontend (client/.env.local)

NEXT_PUBLIC_API_URL=http://localhost:5000/api

Installation Steps
1. Install dependencies

From project root:

npm install

2. Install client and server dependencies

npm run install:apps

3. Create environment files

npm run setup:env

This creates:

server/.env
client/.env.local

(Existing files will not be overwritten)

Database Setup

Before running the application, the database needs to be created.

You can create the database using any of the following methods.

Option 1: Using npm Script (Recommended)

Run:

npm run db:create

This will prompt for your MySQL password and create the vistaflow database if it does not already exist.

Option 2: Using MySQL CLI

Run:

mysql -u<username> -p -e "CREATE DATABASE IF NOT EXISTS vistaflow;"

Example:

mysql -uroot -p -e "CREATE DATABASE IF NOT EXISTS vistaflow;"

Option 3: Using MySQL Workbench

Open MySQL Workbench
Connect to your local MySQL server
Click on "Create Schema"
Enter database name: vistaflow
Click Apply

Step 2: Run Migrations and Seed Data

After creating the database, run:

npm run db:prepare

This will:

Generate the Prisma client
Apply database migrations
Insert initial seed data
Running the Application

Start both frontend and backend:

npm run dev


This runs:

Backend on port 5000
Frontend on port 3001
Access the App

Open:

http://localhost:3001

Demo Credentials

These accounts are seeded automatically:

Admin
admin@vistaflow.com
 / Admin@123

Manager
manager@vistaflow.com
 / Manager@123

Member
member@vistaflow.com
 / Member@123

Quick Setup (Recommended)

For a fresh setup:

npm install
npm run install:apps
npm run setup
npm run dev

Available Scripts

npm run install:apps
npm run setup:env
npm run db:create
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:prepare
npm run setup
npm run dev
npm run build
npm run lint
npm run check

Troubleshooting
Database connection issues
Ensure MySQL is running
Verify credentials in DATABASE_URL
Check port (commonly 3306 or 3307)
Port already in use

If port 5000 is busy:

Update server/.env:

PORT=5050

Then update frontend:

NEXT_PUBLIC_API_URL=http://localhost:5050/api

Restart the project.

Reset database

cd server
npx prisma migrate reset

Notes
Database configuration is fully environment-driven
Prisma ORM is used for schema and migrations
JWT authentication uses HTTP-only cookies
Seed data enables quick testing of role-based features
Soft delete is implemented for data safety and auditability