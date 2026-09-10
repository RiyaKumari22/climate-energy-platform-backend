# Vasudha Climate, Energy & Power Data Platform — Backend

Backend API for the **Vasudha Climate, Energy & Power Data Platform**.

This application provides a role-based backend for uploading, validating, reviewing, approving, rejecting, managing, and publicly serving Climate, Energy, and Power datasets.

The backend is built using:

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT Authentication
- bcryptjs
- Multer
- PapaParse

---

## 1. Project Overview

The platform allows administrators to upload datasets related to:

- Climate
- Energy
- Power

Uploaded datasets go through an approval workflow before they become publicly available.

### User Roles

The backend supports two authenticated administrative roles:

| Role | Responsibilities |
|------|------------------|
| Super Admin | Review datasets, approve/reject datasets, edit/delete datasets, manage administrators |
| Admin | Upload datasets and view/manage their submitted datasets |

Public users do not require an account or authentication to view approved datasets.

---

## 2. Main Features

### Authentication

- JWT-based authentication
- Secure password hashing using bcrypt
- Role-based authorization
- Active/inactive administrator accounts
- Separate permissions for Admin and Super Admin

### Dataset Management

Administrators can upload datasets with:

- Dataset title
- Domain
- Data type
- Visualization type
- Description
- CSV file

Supported domains:

- `CLIMATE`
- `ENERGY`
- `POWER`

Supported data types:

- `LATLONG`
- `STATE`
- `TIMESERIES`

Supported visualization types:

- `MAP`
- `HEATMAP`
- `LINE`
- `BAR`
- `AREA`

### Dataset Approval Workflow

New datasets are automatically created with:

```text
PENDING
