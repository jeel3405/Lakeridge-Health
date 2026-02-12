# Lakeridge Health Hospital - Database Management System

## Project Information
- **Project Title:** Improving Database System for the Hospital
- **Group Members:**
  - Jeel Patel: 100931324
  - Kartik Pandit: 100935721
  - Harshil Rao: 100935323
- **Submission Date:** 27-11-2024

## Website Overview

This is a web-based Hospital Database Management System for Lakeridge Community Hospital (LRCH). The system provides a comprehensive interface to manage all hospital operations including patients, physicians, appointments, admissions, rooms, billing, and insurance.

## Features

### 📊 Dashboard
- Overview of total patients, physicians, appointments, and available rooms
- Recent appointments display
- Room occupancy visualization

### 👥 Patient Management
- View, add, edit, and delete patient records
- Search patients by name, ID, or address
- Filter by gender
- View patient details including appointment history and billing

### 👨‍⚕️ Physician Management
- Manage physician records
- Filter by specialization
- View physician schedules and appointment counts

### 📅 Appointment Management
- Book, edit, and cancel appointments
- Filter by date and status
- View appointment details

### 🏥 Admission Management
- Track patient admissions
- View insurance verification status
- Manage treatment plans

### 🚪 Room & Bed Management
- View room availability by type
- Track bed occupancy
- ICU, Private, Semi-Private, Ward, and Operating Room tracking

### 💰 Billing Management
- View billing records
- Track payment status (Pending, Paid, Processing)
- Financial summary with outstanding amounts

### 🛡️ Insurance Management
- Manage insurance providers
- Filter by province
- View covered patients and claims

### 📋 Patient Records
- Track visit history
- Treatment documentation
- Follow-up date management

### 📄 Insurance Claims
- Manage insurance claims
- Track claim amounts and approval dates
- Filter by approval status

## How to Use

### Opening the Website

1. **Using VS Code Live Server (Recommended):**
   - Install the "Live Server" extension in VS Code
   - Right-click on `index.html`
   - Select "Open with Live Server"

2. **Direct Browser Opening:**
   - Navigate to the `website` folder
   - Double-click on `index.html`
   - The website will open in your default browser

### Navigation
- Use the sidebar menu on the left to navigate between different sections
- Click on any menu item to view that module

### Searching Data
- Use the global search bar at the top to search across all data
- Each section has its own search and filter options

### Adding New Records
- Click the "Add" button (e.g., "Add Patient", "Add Physician") in each section
- Fill in the form and click "Save"

### Viewing Details
- Click the 👁️ (eye) icon to view detailed information about any record

### Editing Records
- Click the ✏️ (edit) icon to modify existing records

### Deleting Records
- Click the 🗑️ (trash) icon to delete records (confirmation required)

## File Structure

```
website/
├── index.html      # Main HTML file
├── styles.css      # CSS styles
├── data.js         # Database data in JavaScript format
├── api.js          # API helper for database connection
├── app.js          # Application logic
├── server.js       # Node.js backend server
├── package.json    # Node.js dependencies
└── README.md       # This file
```

## 🔌 Database Connection Setup

To connect the website to your SQL Server database, follow these steps:

### Prerequisites
1. **Node.js** installed on your computer (download from https://nodejs.org)
2. **SQL Server** running with your database created
3. **Database tables** created (run the `CREATE TABLE (.sql).sql` script)
4. **Sample data** inserted (run the `INSERT Data.sql` script)

### Setup Steps

1. **Open a terminal** in the `website` folder

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure database connection:**
   Open `server.js` and update the database configuration (around line 21):
   ```javascript
   const dbConfig = {
       user: 'sa',                    // Your SQL Server username
       password: 'YOUR_PASSWORD',     // Your SQL Server password
       server: 'localhost',           // Your SQL Server hostname
       database: 'LakeridgeHealth',   // Your database name
       // ... other options
   };
   ```

4. **Start the server:**
   ```bash
   npm start
   ```
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

5. **Open your browser** and go to:
   ```
   http://localhost:3000
   ```

### Troubleshooting

- **"Database connection failed"**: Check your SQL Server credentials and ensure SQL Server is running
- **"ECONNREFUSED"**: Make sure SQL Server is accepting TCP/IP connections on port 1433
- **Enable TCP/IP in SQL Server Configuration Manager** if using a local SQL Server instance

## Database Tables Included

1. **Insurance** - Insurance provider information
2. **Patients** - Patient demographics and insurance
3. **Physicians** - Doctor information and specializations
4. **Rooms** - Room types and capacity
5. **Appointments** - Patient-physician appointments
6. **Admissions** - Hospital admissions
7. **PatientRecords** - Treatment and visit records
8. **InsuranceClaims** - Insurance claim processing
9. **Billing** - Patient invoices and payments
10. **Bed** - Individual bed tracking

## Data Summary

- **50 Insurance Providers** across various Canadian provinces
- **50 Patients** with complete demographic information
- **5 Physicians** with different specializations:
  - Cardiology
  - Pediatrics
  - Orthopedics
  - Neurology
  - General Surgery
- **5 Room Types** (ICU, Private, Semi-Private, Ward, Operating Room)
- **50 Appointments** scheduled
- **30 Admissions** records
- **25 Patient Records**
- **20 Insurance Claims**
- **20 Billing Records**
- **10 Beds** across all rooms

## Browser Compatibility

This website works best on:
- Google Chrome (recommended)
- Mozilla Firefox
- Microsoft Edge
- Safari

## Technologies Used

- HTML5
- CSS3 (with Flexbox and Grid)
- JavaScript (ES6+)
- **Node.js with Express** (backend server)
- **mssql** (SQL Server database connection)
- Font Awesome Icons
- Google Fonts (Inter)

## Notes

- The website can work with or without the database connection
- **Without server**: Data is stored in JavaScript arrays and lost on page refresh
- **With server**: Data is persisted to your SQL Server database
- A green toast notification will confirm when connected to the database

---

© 2024 Lakeridge Community Hospital Database Project | INFT-2101 Database Development 1
