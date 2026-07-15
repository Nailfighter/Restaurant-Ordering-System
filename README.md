<p align="center">
  <img src="Design/Screenshots/Kiosk.png" width="750px" alt="Kiosk Screenshot">
</p>

<h1 align="center">
  Restaurant Ordering System
  <br>
</h1>

<h4 align="center">A comprehensive digital platform that streamlines restaurant ordering, optimizes kitchen operations, and provides insightful business analytics.</h4>
<p align="center">
  <a href="https://reactjs.org/" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  </a>
  <a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  </a>
  <a href="https://expressjs.com/" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  </a>
  <a href="https://supabase.com/" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  </a>
  <a href="https://vitejs.dev/" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  </a>
  <a href="https://sass-lang.com/" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/SCSS-CC6699?style=for-the-badge&logo=sass&logoColor=white" alt="SCSS" />
  </a>
  <a href="https://tailwindcss.com/" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  </a>
  <a href="https://www.docker.com/" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  </a>
</p>



## What is Restaurant Ordering System?

Restaurant Ordering System is a comprehensive digital platform built to streamline and optimize restaurant operations through three key interfaces: a Kitchen Display System (KDS) for kitchen staff, an Order Kiosk for customers, and an Analytics Dashboard for management.

By integrating real-time order tracking, efficient kitchen workflow management, and insightful business intelligence, the system reduces errors, accelerates service, and empowers data-driven decision-making, creating a seamless and efficient restaurant ecosystem.

## Demo

Try out the system live using mock data at these links:  
- **Ordering Kiosk:** [kiosk-ros.shreyansh-dev.app](https://kiosk-ros.shreyansh-dev.app)  
- **Kitchen Display System:** [kitchen-ros.shreyansh-dev.app](https://kitchen-ros.shreyansh-dev.app)  
- **Dashboard:** [dashboard-ros.shreyansh-dev.app](https://dashboard-ros.shreyansh-dev.app)

## Features

### Kitchen Operations

- **Real-time Order Queue**: Live order tracking with status updates
- **Kitchen Workflow Management**: Streamlined order processing and completion
- **Audio/Visual Alerts**: Notifications for new, delayed, and completed orders
- **Multi-device Support**: Optimized for kitchen tablets and displays

### Customer Experience

- **Self-Service Ordering**: Intuitive touch-screen interface for customers
- **Menu Management**: Dynamic menu with categories and customization options
- **Order Tracking**: Real-time order status updates

### Business Intelligence

- **Sales Analytics**: Comprehensive reporting and insights
- **Performance Metrics**: Track key business indicators
- **Data Visualization**: Charts and graphs for better decision making

## Architecture

The project follows a architecture with four main components:

- **Kitchen-Display-System**: React app for kitchen staff (KDS)
- **Order-Kiosk**: React app for customer self-ordering
- **Dashboard**: React app for analytics and management
- **Server**: Node.js/Express backend with a Supabase (Postgres) database

## Quick Start

### Prerequisites

- Node.js (v18+ recommended)
- A [Supabase](https://supabase.com/) project
- Git

### Environment Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Restaurant-Ordering-System
   ```

2. **Create the database schema**

   Run [`schema.sql`](schema.sql) against your Supabase project (via the SQL editor in the dashboard, or the Supabase MCP/CLI). It creates the `orders`/`order_items` tables, the dashboard RPC functions, and the grants the app needs.

3. **Set up environment variables**

   All apps share a single `.env` file at the **repo root** (Vite is configured with `envDir: '../'`, and the server loads `dotenv` from `../.env`):

   ```env
   # Server
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_KEY=your-anon-or-service-role-key
   PORT=3000

   # Frontends
   VITE_API_URL=http://localhost:3000
   VITE_WSS_URL=ws://localhost:3000
   ```

4. **Install dependencies**

   ```bash
   # Backend dependencies
   cd Server
   npm install

   # Frontend dependencies
   cd ../Kitchen-Display-System
   npm install
   cd ../Order-Kiosk
   npm install
   cd ../Dashboard
   npm install
   ```

5. **Start the backend**

   ```bash
   cd Server
   npm start
   ```

   Runs on `http://localhost:3000` by default.

6. **Start the frontends** (in separate terminals)

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

   Each runs on Vite's default port `5173` — if you run more than one at a time, Vite automatically shifts the rest to `5174`, `5175`, etc.

### Running with Docker

A full Docker Compose setup lives in [`docker/`](docker), building each React app with a multi-stage Node → Nginx image and the backend as a plain Node image. All four services join an external `traefik_net` network for reverse-proxy routing.

```bash
docker compose --env-file .env -f docker/docker-compose.yml up --build
```

This must be run from the repo root so Compose can find the shared `.env` (the compose file itself lives in `docker/`).

## Project Structure

```
Restaurant-Ordering-System/
├── Kitchen-Display-System/   # Kitchen display React app (KDS)
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── contexts/         # React contexts
│   │   ├── hooks/            # Custom hooks
│   │   └── styles/           # SCSS stylesheets
│   ├── public/
│   │   └── Icon/             # Application icons
│   └── package.json
├── Order-Kiosk/             # Customer self-ordering React app
│   ├── src/
│   │   ├── components/       # Order interface components
│   │   ├── contexts/         # Order state management
│   │   └── styles/           # Order interface styles
│   └── package.json
├── Dashboard/               # Analytics and management React app
│   ├── src/
│   │   ├── components/       # Dashboard components
│   │   ├── charts/           # Data visualization
│   │   └── styles/           # Dashboard styles
│   └── package.json
├── Server/                  # Node.js/Express backend
│   ├── App.js               # Main application file
│   ├── Database.js          # Supabase client & queries
│   └── package.json
├── docker/                  # Docker Compose + per-service Dockerfiles/nginx configs
├── schema.sql                # Supabase/Postgres schema (tables, RPC functions, grants)
├── .env                      # Shared environment variables for all apps (gitignored)
└── Design/                  # Design assets and mockups
```

## Technologies Used

### Frontend

- **React** - UI framework for all three applications
- **Vite** - Build tool and development server
- **SCSS** - Advanced CSS preprocessing (Kitchen Display & Order Kiosk)
- **Tailwind CSS** - Utility-first CSS framework (Dashboard)
- **Framer Motion** - Animation library for smooth transitions
- **React Context** - State management across components

### Backend

- **Node.js** - JavaScript runtime environment
- **Express** - Web application framework
- **Supabase** - Postgres database, accessed via `@supabase/supabase-js`
- **RESTful API** - Standard API design patterns
- **WebSockets (ws)** - Real-time order/status broadcasts to connected clients

### Infrastructure

- **Docker / Docker Compose** - Containerized builds for all four services
- **Nginx** - Serves the built frontend static assets
- **Traefik** - Reverse proxy (services join an external `traefik_net` network)
- **GitHub Actions** - Self-hosted deploy workflow on push to `main`

### Development Tools

- **ESLint** - Code quality and consistency
- **Git** - Version control system
- **npm** - Package management
