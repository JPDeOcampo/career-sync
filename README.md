# Career Sync

Career Sync is a full-stack job application management platform that helps developers track job applications, manage interviews, and organize their career search.

The project uses a **monorepo architecture** with shared code between frontend and backend.

---

# Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- Express
- Prisma
- PostgreSQL

### Infrastructure
- Vercel
- Supabase
- pnpm Workspaces

---

# Monorepo Structure

```
career-sync
│
├─ apps
│   ├─ backend        # Express API
│   └─ frontend       # Next.js app
│
├─ packages
│   └─ shared         # Shared schemas, types, validators
│
├─ pnpm-workspace.yaml
├─ package.json
└─ tsconfig.base.json
```

---

# Installation

Clone the repository:

```
git clone https://github.com/your-username/career-sync.git
cd career-sync
```

Install dependencies:

```bash
pnpm install
```

---

# Workspace Configuration

The project uses **pnpm workspace**.

`pnpm-workspace.yaml`

```yaml
packages:
  - apps/*
  - packages/*
```

---

# Environment Variables

Create `.env` inside:

```bash
apps/backend
```

Example:

```
NODE_ENV=
DOMAIN=
ORIGIN=

EMAIL_USER=
EMAIL_PASS=

DATABASE_URL=
SHADOW_DATABASE_URL=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
PEPPER=

SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_URL=
```

Create `.env` inside:

```bash
apps/frontend
```
Example:
```bash
NEXT_PUBLIC_API_URL=
```

---

# Running the Project

### Start Both
```bash
pnpm run dev
```
### Start Backend

```bash
pnpm --filter backend dev
```

Backend runs on:

```bash
http://localhost:5000
```

---

### Start Frontend

```bash
pnpm --filter frontend dev
```

Frontend runs on:

```bash
http://localhost:3000
```

---

# Shared Package

The shared package contains reusable code used by both frontend and backend.

Example:

```
packages/shared/src/validators
packages/shared/src/types
packages/shared/src/constant
```

Import example:

```ts
import { userSchema } from "@career-sync/shared"
```

---

# Build

Build backend:

```bash
pnpm --filter backend build
```

Build shared package:

```bash
pnpm --filter shared build
```

---

# Deploy Backend (Vercel)

The backend runs as a **serverless Express API** on Vercel.


### 1 Build command

Build Command Prod:

```bash
pnpm --filter @career-sync/shared build && pnpm --filter backend build
```

Output directory Prod:
```bash
dist
```

---

### 2 Set Vercel Root Directory

```bash
apps/backend
```

---

# Deploy Frontend

Deploy frontend separately.

Set root directory:

```bash
apps/frontend
```

---

# API Example

```
POST /api/v1/auth/signup
POST /api/v1/auth/login
GET /api/v1/user
```

---

# Features

- JWT Authentication
- Cookie-based sessions
- API rate limiting
- Input validation with Zod
- Prisma ORM
- Shared validation schemas

---

# Future Improvements

- Job application dashboard
- Resume parser
- Application analytics
- OAuth login (Google / GitHub)

---
