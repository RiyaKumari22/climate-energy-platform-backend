# Climate Energy Platform - Backend

Backend API for the Climate, Energy and Power data visualization platform.

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT authentication
- bcryptjs
- Multer
- PapaParse

## Features

- Admin and Super Admin authentication
- JWT-based authorization
- Dataset CSV upload
- CSV schema and data validation
- Dataset approval/rejection workflow
- Public approved dataset API
- Dataset management
- Admin management
- PostgreSQL database with Prisma

## Setup

### 1. Clone the repository

git clone https://github.com/RiyaKumari22/climate-energy-platform-backend.git

### 2. Install dependencies

cd climate-energy-platform-backend
npm install

### 3. Create environment file

Create a .env file using .env.example as a reference.

Add your local PostgreSQL database URL and JWT secret.

### 4. Set up Prisma

npx prisma generate
npx prisma migrate dev

### 5. Create the default Super Admin

node prisma/seed.js

Default credentials:

Email: superadmin@vasudhaindia.org
Password: Admin@123

### 6. Start the server

node src/server.js

The API runs on:

http://localhost:5000

Health check:

http://localhost:5000/api/health

## Main API Routes

POST /api/auth/login

GET /api/datasets/public

GET /api/datasets

POST /api/datasets/upload

PATCH /api/datasets/:id/approve

PATCH /api/datasets/:id/reject

PATCH /api/datasets/:id

DELETE /api/datasets/:id

## Environment Variables

See .env.example.

Never commit the actual .env file.

## License

This project was developed as part of a technical assessment.
