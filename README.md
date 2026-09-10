# Assessment Submission

This project was developed as part of the Vasudha Climate, Energy & Power technical assessment.

## Public Repositories

### Frontend

https://github.com/RiyaKumari22/climate-energy-platform-frontend

### Backend

https://github.com/RiyaKumari22/climate-energy-platform-backend

## Deployed Application

Frontend:

https://climate-energy-platform-frontend.onrender.com/

Backend API:

https://climate-energy-platform-backend.onrender.com

Health Check:

https://climate-energy-platform-backend.onrender.com/api/health

## Implemented Features

### Authentication & Authorization

- Super Admin authentication
- Admin authentication
- JWT-based authentication
- Password hashing using bcrypt
- Role-based access control
- Protected administrative routes
- Active/inactive Admin accounts

### Dataset Management

- Dataset upload through CSV files
- Dataset title and description
- Climate, Energy and Power domain selection
- Latitude/Longitude data support
- State-wise data support
- Time-series data support
- Visualization type selection
- Dynamic dataset record storage

### CSV Validation

- CSV file validation
- Required column validation
- Missing field validation
- Numeric field validation
- Latitude validation
- Longitude validation
- Year validation
- Malformed CSV detection
- Validation error messages

### Dataset Approval Workflow

- New datasets are created as Pending
- Super Admin can review datasets
- Super Admin can approve datasets
- Super Admin can reject datasets
- Only approved datasets are publicly accessible
- Dataset uploader information is maintained
- Dataset approval information is maintained

### Super Admin Management

- Create Admin accounts
- Edit Admin accounts
- Enable Admin accounts
- Disable Admin accounts
- Delete Admin accounts
- View administrator information

### Dataset Administration

- View datasets
- Edit datasets
- Delete datasets
- Approve datasets
- Reject datasets
- Track dataset status
- Track dataset uploader

### Public Data Access

- Public dataset API
- No authentication required for public datasets
- Domain-based dataset filtering
- Approved datasets only

## Additional / Bonus Features

The following additional features were implemented beyond the basic dataset upload workflow:

- Dynamic dataset visualization based on dataset metadata
- Interactive India map visualization for latitude/longitude datasets
- Interactive India state heatmap for state-wise datasets
- Line, bar and area chart support for time-series datasets
- Responsive administrative dashboard
- Admin profile information in the navigation
- Centralized logout functionality
- Prisma-based relational data model
- JSON-based flexible dataset record storage
- Production deployment using Render
- PostgreSQL database hosted for the deployed application
- Health-check API endpoint
