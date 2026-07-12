# 🚀 AssetPlanet — Enterprise Asset Management System

A production-ready ERP system for managing enterprise assets, allocations, bookings, maintenance, and audits. Features a modern React frontend dashboard with a floating AI Assistant, live workspace reporting, and a robust Node.js/Express backend API.

---

## 🎨 New & Enhanced Features
*   **AssetPlanet AI Assistant**: A conversational floating chatbot that runs on live backend APIs to search assets, explain statistics, navigate routes, audit items, and track maintenance.
*   **Dashboard Export Report**: Instantly download workspace summaries, category/department breakdowns, and trends as a plain-text report.
*   **Interactive CRUD Management**: Full category and department creation, update, and deletion systems.
*   **Real-time CSV Exports**: Instantly download complete directories of assets and employees matching active search filters.
*   **Profile Self-Service**: Users can directly modify their personal profiles (first/last name, phone numbers) which sync with backend storage.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TanStack Query & Router, TailwindCSS |
| Runtime | Node.js 20 |
| Framework | Express.js |
| Language | TypeScript (strict) |
| Database | PostgreSQL 16 |
| ORM | Prisma |
| Auth | JWT + Refresh Tokens + Google OAuth 2.0 |
| Validation | Zod |
| API Docs | Swagger/OpenAPI 3.0 |
| Security | Helmet, CORS, Rate Limiting |
| Logging | Winston + Morgan |
| Container | Docker + Docker Compose |

---

## 📁 Project Structure

```
.
├── backend/            # Express, Prisma & PostgreSQL API
│   ├── config/         # Database, JWT, Passport OAuth configs
│   ├── controllers/    # Route handlers
│   ├── services/       # Core business logic
│   ├── repositories/   # DB query abstraction layer
│   └── routes/         # API Endpoint definitions
└── frontend/           # React dashboard UI
    ├── src/
    │   ├── components/ # AI Assistant Widget, App Sidebar layouts
    │   ├── lib/        # API Client, Auth context, query hooks
    │   └── routes/     # TanStack routing page routes
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (or Docker)
- npm or yarn

### 1. Clone & Install

```bash
git clone <repo-url>
cd Odoo-Hackathon-AssetFlow
npm install
```

### 2. Environment Setup

Configure `.env` files in both directories based on the `.env.example` templates.

### 3. Database Setup

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npm run seed
```

### 4. Start Workspace

```bash
# Run both frontend & backend concurrently
npm run dev:all
```

---

## 📚 API Documentation

Interactive Swagger docs available at:
```
http://localhost:5000/api/docs
```

---

## 🔑 Default Credentials (After Seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@assetflow.com | Admin123@ |
| Asset Manager | manager1@assetflow.com | Password@123 |
| Employee | emp1@assetflow.com | Password@123 |

---

## 🗺️ API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/register | Register new user |
| POST | /api/v1/auth/login | Login |
| PATCH | /api/v1/auth/me | Update current user profile |
| POST | /api/v1/auth/logout | Logout |
| GET | /api/v1/auth/me | Get current user |

### Assets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/assets | List assets (search, filter, paginate) |
| POST | /api/v1/assets | Create asset |
| PUT | /api/v1/assets/:id | Update asset |
| DELETE | /api/v1/assets/:id | Delete asset |

### Other CRUD
- `/api/v1/departments` — Department CRUD
- `/api/v1/categories` — Category CRUD
- `/api/v1/bookings` — Booking & Resource scheduling
- `/api/v1/maintenance` — Service request tickets
- `/api/v1/audit` — Verification cycles

---

*Built for AssetPlanet — Production-Ready Enterprise Asset Management*
