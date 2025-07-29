<p align="center">
  <img src="Kitchen-Display-System/public/Icon/KDS-Title.png" height="200px">
</p>

<h1 align="center">
  Restaurant Ordering System
  <br>
</h1>

<h4 align="center">A digital system for restaurant order kiosks, kitchen workflow, and business analytics.</h4>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#️-architecture">Architecture</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-project-structure">Project Structure</a> •
  <a href="#-technologies-used">Technologies Used</a> •
  <a href="#-license">License</a>
</p>

## What is Restaurant Ordering System?

Restaurant Ordering System is a digital platform for restaurant order kiosks, kitchen workflow, and business analytics. It consists of three main React frontends (Kitchen Display, Order Kiosk, Dashboard) and a Node.js backend, designed to streamline kitchen operations, order tracking, and business insights.

## Features

- **Kitchen Display**: Real-time order queue, status tracking, and kitchen workflow management
- **Order Kiosk**: Customer-facing self-ordering interface
- **Dashboard**: Sales analytics, insights, and reporting
- **Multi-device support**: Optimized for touch screens and tablets
- **Customizable UI**: Modern, responsive design with custom fonts and icons
- **Audio/Visual Alerts**: For new, delayed, and completed orders
- **Role-based Views**: Separate interfaces for kitchen staff, customers, and managers

## Architecture

The project is organized as a monorepo with four main components:

- **Kitchen-Display-System/**: React app for kitchen staff (KDS)
- **Order-Kiosk/**: React app for customer self-ordering
- **Dashboard/**: React app for analytics and management
- **Server/**: Node.js/Express backend with MySQL database

## Quick Start

### Prerequisites

- Node.js (v18+ recommended)
- MySQL server

### Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Kitchen-Display-System
   ```

2. **Install dependencies**

   ```bash
   # Install backend dependencies
   cd Server
   npm install

   # Install frontend dependencies
   cd ../Kitchen-Display-System
   npm install
   cd ../Order-Kiosk
   npm install
   cd ../Dashboard
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in each subproject as follows:

   **Server/.env**
   ```env
   RDB_HOST=localhost
   RDB_PORT=3306
   RDB_USER=your_mysql_user
   RDB_PASSWORD=your_mysql_password
   RDB_DATABASE=your_database_name
   ```

   **Kitchen-Display-System/.env**
   ```env
   VITE_API_URL=http://localhost:5000
   ```

   **Order-Kiosk/.env**
   ```env
   VITE_API_URL=http://localhost:5000
   ```

   **Dashboard/.env**
   ```env
   VITE_API_URL=http://localhost:5000
   ```

   Adjust the values as needed for your environment.

4. **Start the backend**

   ```bash
   cd Server
   npm start
   ```

5. **Start the frontends** (in separate terminals)

   ```bash
   # Kitchen Display
   cd Kitchen-Display-System
   npm run dev

   # Order Kiosk
   cd ../Order-Kiosk
   npm run dev

   # Dashboard
   cd ../Dashboard
   npm run dev
   ```

## Project Structure

```
Kitchen-Display-System/
├── Kitchen-Display-System/   # Kitchen display React app (KDS)
│   ├── src/
│   ├── public/
│   └── ...
├── Order-Kiosk/             # Customer self-ordering React app
│   ├── src/
│   ├── public/
│   └── ...
├── Dashboard/               # Analytics and management React app
│   ├── src/
│   ├── public/
│   └── ...
├── Server/                  # Node.js/Express backend
│   ├── App.js
│   ├── Database.js
│   └── ...
└── Design/                  # Design assets and mockups
```

## Technologies Used

- **Frontend**: React, Vite, SCSS, Tailwind CSS (Dashboard)
- **Backend**: Node.js, Express, MySQL
- **State Management**: React Context
- **Styling**: SCSS, Tailwind CSS, custom fonts
- **Dev Tools**: ESLint, Vite, Framer Motion

## License

This project is licensed under the ISC License (see `Server/package.json`).
