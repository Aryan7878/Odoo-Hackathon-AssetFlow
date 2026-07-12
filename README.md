# 🚀 AssetFlow — Enterprise Asset Management System

A production-ready backend API for managing enterprise assets, allocations, bookings, maintenance, and audits. Built with Node.js, Express, TypeScript, PostgreSQL, and Prisma ORM.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 |
| Framework | Express.js |
| Language | TypeScript (strict) |
| Database | PostgreSQL 16 |
| ORM | Prisma |
| Auth | JWT + Refresh Tokens |
| Validation | Zod |
| API Docs | Swagger/OpenAPI 3.0 |
| Security | Helmet, CORS, Rate Limiting |
| Logging | Winston + Morgan |
| Container | Docker + Docker Compose |

---

## 📁 Project Structure

```
src/
├── config/         # Database, JWT, Swagger, Env config
├── controllers/    # HTTP request handlers only
├── services/       # Business logic layer
├── repositories/   # Database access layer (Prisma)
├── middlewares/    # Auth, RBAC, Error, Rate Limiter
├── validators/     # Zod schemas for request validation
├── routes/         # Express route definitions
├── types/          # TypeScript types & interfaces
├── constants/      # App-wide constants & messages
├── utils/          # Helpers: pagination, response, logger
├── app.ts          # Express app setup
└── server.ts       # Server entry point

prisma/
├── schema.prisma   # Complete database schema
└── seed.ts         # Database seed script
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
cd assetflow-backend
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed with demo data
npm run seed
```

### 4. Start Server

```bash
# Development (with hot-reload)
npm run dev

# Production
npm run build && npm start
```

---

## 🐳 Docker Setup

```bash
# Start all services (PostgreSQL + API + Adminer)
docker-compose up -d

# Run migrations
docker-compose exec api npx prisma migrate dev

# Seed
docker-compose exec api npm run seed

# View logs
docker-compose logs -f api
```

**Services:**
- API: http://localhost:5000
- Adminer (DB UI): http://localhost:8080
- PostgreSQL: localhost:5432

---

## 📚 API Documentation

Interactive Swagger docs available at:
```
http://localhost:5000/api/docs
```

Raw OpenAPI JSON:
```
http://localhost:5000/api/docs.json
```

---

## 🔑 Default Credentials (After Seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@assetflow.com | Password@123 |
| Asset Manager | manager1@assetflow.com | Password@123 |
| Asset Manager | manager2@assetflow.com | Password@123 |
| Employee | emp1@assetflow.com | Password@123 |

---

## 🗺️ API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/register | Register new user |
| POST | /api/v1/auth/login | Login |
| POST | /api/v1/auth/refresh | Refresh access token |
| POST | /api/v1/auth/logout | Logout |
| GET | /api/v1/auth/me | Get current user |

### Assets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/assets | List assets (search, filter, paginate) |
| POST | /api/v1/assets | Create asset (auto-tag: AF-00001) |
| GET | /api/v1/assets/:id | Get asset details |
| PUT | /api/v1/assets/:id | Update asset |
| DELETE | /api/v1/assets/:id | Delete asset |
| GET | /api/v1/assets/:id/history | Asset allocation/maintenance history |

### Allocations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/allocations | List allocations |
| POST | /api/v1/allocations | Allocate asset to user |
| GET | /api/v1/allocations/:id | Get allocation |
| POST | /api/v1/allocations/:id/return | Return asset |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/bookings | List bookings |
| POST | /api/v1/bookings | Create booking |
| GET | /api/v1/bookings/calendar | Calendar view |
| GET | /api/v1/bookings/:id | Get booking |
| PUT | /api/v1/bookings/:id | Update booking |
| POST | /api/v1/bookings/:id/cancel | Cancel booking |

### Maintenance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/maintenance | List requests |
| POST | /api/v1/maintenance | Raise request |
| GET | /api/v1/maintenance/:id | Get request |
| POST | /api/v1/maintenance/:id/approve | Approve |
| POST | /api/v1/maintenance/:id/reject | Reject |
| POST | /api/v1/maintenance/:id/start | Start (→ UNDER_MAINTENANCE) |
| POST | /api/v1/maintenance/:id/complete | Complete (→ AVAILABLE) |

### Transfers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/transfers | List transfer requests |
| POST | /api/v1/transfers | Request transfer |
| GET | /api/v1/transfers/:id | Get request |
| POST | /api/v1/transfers/:id/approve | Approve & execute |
| POST | /api/v1/transfers/:id/reject | Reject |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/dashboard/stats | Aggregate statistics |
| GET | /api/v1/dashboard/charts | Chart data |

### Other CRUD
- `/api/v1/departments` — Department CRUD
- `/api/v1/categories` — Category CRUD
- `/api/v1/resources` — Bookable resource CRUD
- `/api/v1/audit` — Audit cycle management
- `/api/v1/notifications` — User notifications

---

## 🔐 Role-Based Access Control

| Endpoint | EMPLOYEE | ASSET_MANAGER | ADMIN |
|----------|----------|---------------|-------|
| View Assets | ✅ | ✅ | ✅ |
| Create/Update Assets | ❌ | ✅ | ✅ |
| Delete Assets | ❌ | ❌ | ✅ |
| Allocate Assets | ❌ | ✅ | ✅ |
| Approve Maintenance | ❌ | ✅ | ✅ |
| Approve Transfers | ❌ | ✅ | ✅ |
| Manage Departments | ❌ | ❌ | ✅ |
| Create Audit Cycles | ❌ | ✅ | ✅ |

---

## 🗄️ Database Schema

**12 Models:** User, Department, Category, Asset, Allocation, TransferRequest, Resource, Booking, MaintenanceRequest, AuditCycle, AuditItem, Notification, ActivityLog

**Key Business Rules:**
- Asset tags auto-generated: `AF-00001`, `AF-00002`, ...
- Only one active allocation per asset (HTTP 409 on conflict)
- Booking overlap prevention using time range intersection
- Maintenance workflow: PENDING → APPROVED → IN_PROGRESS → COMPLETED
- Transfer approval closes old allocation and creates new one

---

## 🌱 Seed Data

After running `npm run seed`:

| Entity | Count |
|--------|-------|
| Departments | 5 |
| Categories | 6 |
| Users | 13 (1 admin, 2 managers, 10 employees) |
| Resources | 10 |
| Assets (tagged) | 50 (AF-00001 to AF-00050) |
| Allocations | 20 |
| Bookings | 20 |
| Maintenance Requests | 10 |
| Audit Cycles | 2 |
| Notifications | 30 |
| Activity Logs | 100 |

---

## 📋 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Compile TypeScript
npm start            # Start production server
npm run seed         # Seed database with demo data
npm run prisma:studio # Open Prisma Studio (DB GUI)
npm run prisma:migrate # Run database migrations
npm run prisma:reset  # Reset database
npm run typecheck    # TypeScript type check
```

---

## 🏗️ Architecture

```
Request → Routes → Middleware → Controller → Service → Repository → Prisma → PostgreSQL
                    ↓
              (Auth, RBAC, Validation, Rate Limit, Error Handler)
```

- **Controllers**: HTTP-only (parse request, call service, send response)
- **Services**: Business logic, rules, cross-entity operations
- **Repositories**: Database queries via Prisma (no SQL, type-safe)

---

## 🔒 Security Features

- JWT access tokens (15min) + refresh tokens (7 days)
- bcrypt password hashing (12 rounds)
- Helmet security headers
- CORS configuration
- Rate limiting (100 req/15min general, 10 req/15min auth)
- Zod request validation
- SQL injection prevention via Prisma
- Environment variable validation at startup

---

*Built for AssetFlow Hackathon — Production-Ready Enterprise Asset Management*
