# Daily Revenue Report App

A full-stack application to manage daily revenue reports.

## Prerequisites
- Node.js installed
- MySQL Server installed and running

## Setup Instructions

### 1. Database Setup
1. Open your MySQL client.
2. Execute the SQL script located at `database/schema.sql` to create the database and table.

### 2. Configuration & Startup
1. Copy the `.env.example` file to `.env` in the root directory (next to `docker-compose.yml`):
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_PORT=3306
   APP_PORT=5432
   ```
2. Run `docker-compose up --build -d` to start the app.

### 3. Frontend Setup
1. Navigate to the `frontend` directory.
2. Run `npm install` (if not already done).
3. Run `npm run dev`.
4. Open the browser at the provided Vite URL (usually `http://localhost:5173`).

## Features
- **Real-time Totals**: Total Revenue and Total Leasing update as you type.
- **Smart Mode**: Automatically detects if a record exists for the selected Date and MD Name, switching to "Update Mode".
- **Validation**: Ensures numeric fields are non-negative and required fields are filled.
- **Premium UI**: Modern glassmorphism design with responsive sections.
