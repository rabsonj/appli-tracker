# AGENTS.md — Appli Tracker

> This file is the single source of truth for any AI agent or human contributor
> working on this codebase. Read it fully before making any changes.
> Update it when conventions or project structure change.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Repo Structure](#2-repo-structure)
3. [Backend](#3-backend)
   - [Setup](#31-setup)
   - [Environment Variables](#32-environment-variables)
   - [Architecture](#33-architecture)
   - [Code Style](#34-code-style)
   - [Models & Database](#35-models--database)
   - [State Machine](#36-state-machine)
   - [API & Permissions](#37-api--permissions)
   - [Testing](#38-testing)
   - [Common Mistakes](#39-common-mistakes)
4. [Frontend](#4-frontend)
    - [Stack](#41-stack)
    - [Setup](#42-setup)
    - [Environment Variables](#43-environment-variables)
    - [Architecture](#44-architecture)
    - [Code Style](#45-code-style)
    - [API & State Management](#46-api--state-management)
5. [Git Conventions](#5-git-conventions)
6. [Deployment](#6-deployment)

---

## 1. Project Overview

**Appli Tracker** is a two-sided submission and approval workflow application.

- **Applicants** create, edit, and submit applications and track their status.
- **Reviewers** process incoming applications — approving, rejecting, or returning
  them for changes.

The core of the system is a **strictly enforced state machine** with an
**immutable audit trail**. Every status transition is validated server-side;
no client can bypass it.

**Stack:**
- Backend: Django 5 + Django REST Framework + django-fsm
- Database: PostgreSQL
- Auth: JWT via `djangorestframework-simplejwt`
- Frontend: Next.js (App Router) + TypeScript + Tailwind CSS
- Hosting: Railway (backend + DB), Vercel (frontend)

---

## 2. Repo Structure

```
appli-tracker/
├── AGENTS.md                  # This file
├── README.md                  # Human-facing project documentation
├── backend/
│   ├── manage.py
│   ├── Pipfile
│   ├── config/
│   ├── users/
│   ├── applications/
│   └── common/
└── frontend/
    ├── app/
    │   ├── (applicant)/
    │   ├── (auth)/
    │   ├── (reviewer)/
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components/
    │   ├── ui/                  # Shadcn UI components
    │   ├── applications/
    │   └── auth/
    ├── constants/
    ├── hooks/
    ├── lib/
    │   ├── api/
    │   ├── axios.ts
    │   └── utils.ts
    ├── src/
    │   └── types/
    │       └── api.ts           # Auto-generated API types
    ├── store/
    │   └── auth.ts              # Zustand auth store
    ├── package.json
    └── next.config.ts
```

---

## 3. Backend

### 3.1 Setup

All backend commands run from `backend/`:

```bash
cd backend

# Install dependencies
pipenv install

# Activate virtualenv
pipenv shell

# Copy env file and fill in values
cp .env.example .env

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files (required for Django admin)
python manage.py collectstatic

# Start dev server
python manage.py runserver
```

**Create test users via the Django shell:**

```bash
python manage.py shell
```

```python
from users.models import User

User.objects.create_user(
    username="applicant",
    password="applicant123",
    role="applicant",
)

User.objects.create_user(
    username="reviewer",
    password="reviewer123",
    role="reviewer",
)
```

---

### 3.2 Environment Variables

`.env` lives at `backend/.env`. Never commit it.
`.env.example` is committed — always keep it in sync when adding new variables.

| Variable | Description | Example |
|---|---|---|
| `SECRET_KEY` | Django secret key | `change-me-in-production` |
| `DEBUG` | Debug mode | `True` (dev) / `False` (prod) |
| `ALLOWED_HOSTS` | Comma-separated hosts | `localhost,127.0.0.1` |
| `DATABASE_URL` | Full Postgres URL (used on Railway) | `postgres://user:pass@host/db` |
| `POSTGRES_DB` | DB name (used locally if no `DATABASE_URL`) | `appli_tracker` |
| `POSTGRES_USER` | DB user | `appli_tracker` |
| `POSTGRES_PASSWORD` | DB password | `yourpassword` |
| `POSTGRES_HOST` | DB host | `localhost` |
| `POSTGRES_PORT` | DB port | `5432` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated frontend origins | `http://localhost:3000` |

**Database resolution order in `config/settings.py`:**

```python
if DATABASE_URL:
    # Railway injects this — used in production
    DATABASES = {"default": dj_database_url.parse(DATABASE_URL, conn_max_age=600)}
else:
    # Individual vars used locally
    DATABASES = {"default": {...}}
```

`load_dotenv(BASE_DIR / ".env")` is called at the top of `settings.py`.
On Railway, env vars are injected directly so `load_dotenv()` is a no-op.

---

### 3.3 Architecture

**App layout:**

- `users/` — Custom `User` model extending `AbstractUser`. Owns auth endpoints.
- `applications/` — Core domain. `Application` model with FSM-managed status,
  `AuditLog` model, all transition endpoints, and permission classes.
- `common/` — Shared permission classes and the custom DRF exception handler.
  No models live here.

**Request lifecycle:**

```
Client → JWTAuthentication → Permission classes → View → FSM transition
       → transaction.atomic() [transition + AuditLog write] → Response
```

Every mutation that changes application status goes through `_do_transition()`
in `ApplicationViewSet`. This is the only place transitions are called.

---

### 3.4 Code Style

This project follows the [Google Python Style Guide](https://google.github.io/styleguide/pyguide.html).
Key rules enforced here:

**Naming:**
- Modules: `snake_case`
- Classes: `CapWords`
- Functions and variables: `snake_case`
- Constants: `UPPER_SNAKE_CASE`
- Private methods: `_leading_underscore`

**Imports — always in this order, separated by blank lines:**
```python
# 1. Standard library
import os
from datetime import timedelta

# 2. Third-party
from django.db import models
from rest_framework import serializers

# 3. Local
from applications.models import Application
from common.permissions import IsReviewer
```

**Docstrings:**
- All public classes and functions get a docstring.
- One-liners for obvious methods; multi-line for anything with side effects.

```python
def submit(self):
    """Transition the application from DRAFT to SUBMITTED status."""
    pass
```

**Line length:** 100 characters max.

**No bare `except`:** Always catch specific exceptions.

```python
# Good
except TransitionNotAllowed:
    ...

# Bad
except Exception:
    ...
```

**Type hints:** Use them on all new functions.

```python
def get_queryset(self) -> QuerySet:
    ...
```

---

### 3.5 Models & Database

**`User` (`users/models.py`)**

Extends `AbstractUser`. The `role` field is the only addition.
Use `user.is_applicant` and `user.is_reviewer` properties — never compare
`user.role == "applicant"` inline in views.

```python
# Good
if request.user.is_reviewer:
    ...

# Bad
if request.user.role == "reviewer":
    ...
```

**`Application` (`applications/models.py`)**

The `status` field uses `FSMField(protected=True)`.
**Never assign to `status` directly.** Always call the transition method:

```python
# Good
application.submit()
application.save()

# Bad — raises AttributeError by design
application.status = Application.SUBMITTED
```

**`AuditLog` (`applications/models.py`)**

Append-only. Every status transition writes exactly one row.
The admin is locked down — no add, change, or delete permissions.
Never write to `AuditLog` outside of `_do_transition()` in `views.py`.

**Migrations:**

Always generate migrations after model changes:

```bash
python manage.py makemigrations
python manage.py migrate
```

Never edit migration files manually unless fixing a merge conflict.
Never use `--fake` in development.

---

### 3.6 State Machine

The full transition map:

```
DRAFT ──submit──▶ SUBMITTED ──start_review──▶ UNDER_REVIEW ──approve──▶ APPROVED
  ▲                                                │
  │                                                ├──reject──▶ REJECTED
  └──────────── return_for_changes ◀───────────────┘
```

| Transition | From | To | Who | Comment Required |
|---|---|---|---|---|
| `submit` | DRAFT | SUBMITTED | Owner (Applicant) | No |
| `start_review` | SUBMITTED | UNDER_REVIEW | Reviewer | No |
| `approve` | UNDER_REVIEW | APPROVED | Reviewer | No |
| `reject` | UNDER_REVIEW | REJECTED | Reviewer | **Yes** |
| `return_for_changes` | UNDER_REVIEW | DRAFT | Reviewer | **Yes** |

**Every transition follows this exact pattern — do not deviate:**

```python
def _do_transition(self, request, transition_fn, from_status, to_status, comment=""):
    application = self.get_object()
    self.check_object_permissions(request, application)

    try:
        with transaction.atomic():
            application = Application.objects.select_for_update().get(pk=application.pk)
            transition_fn(application)
            application.save()
            AuditLog.objects.create(
                application=application,
                actor=request.user,
                from_status=from_status,
                to_status=to_status,
                comment=comment,
            )
    except TransitionNotAllowed:
        return Response(
            {"error": "transition_not_allowed", "detail": "...", "status_code": 400},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(ApplicationSerializer(application).data)
```

`select_for_update()` prevents race conditions when two reviewers act on the
same application simultaneously. `transaction.atomic()` ensures the status
change and audit log write are always consistent — both succeed or both roll back.

---

### 3.7 API & Permissions

**Base URL:** `http://localhost:8000/api/`

**Auth endpoints:**
```
POST /api/auth/login/           → { access, refresh }
POST /api/auth/token/refresh/   → { access }
GET  /api/auth/me/              → { id, username, email, role, ... }
```

**Application endpoints:**
```
GET    /api/applications/                        # list
POST   /api/applications/                        # create (applicant only)
GET    /api/applications/:id/                    # detail
PATCH  /api/applications/:id/                    # edit (owner + draft only)
DELETE /api/applications/:id/                    # delete (owner + draft only)
POST   /api/applications/:id/submit/
POST   /api/applications/:id/start-review/
POST   /api/applications/:id/approve/
POST   /api/applications/:id/reject/             # body: { comment }
POST   /api/applications/:id/return-for-changes/ # body: { comment }
GET    /api/applications/:id/audit-log/
```

**Permission classes:**

| Class | Location | Checks |
|---|---|---|
| `IsApplicant` | `common/permissions.py` | `user.is_applicant` |
| `IsReviewer` | `common/permissions.py` | `user.is_reviewer` |
| `IsOwner` | `applications/permissions.py` | `obj.owner == user` |
| `IsOwnerOrReviewer` | `applications/permissions.py` | Owner or reviewer |
| `CanEditApplication` | `applications/permissions.py` | Owner + DRAFT status |

**Authorization matrix:**

| Action | Applicant (owner) | Applicant (non-owner) | Reviewer |
|---|---|---|---|
| Create | ✅ | ✅ | ❌ 403 |
| Edit | ✅ (draft only) | ❌ 403 | ❌ 403 |
| Submit | ✅ | ❌ 403 | ❌ 403 |
| Start review | ❌ 403 | ❌ 403 | ✅ |
| Approve | ❌ 403 | ❌ 403 | ✅ |
| Reject | ❌ 403 | ❌ 403 | ✅ |
| Return | ❌ 403 | ❌ 403 | ✅ |

**Error response shape — all errors follow this structure:**

```json
{
  "error": "forbidden",
  "detail": "Only reviewers can perform this action.",
  "status_code": 403
}
```

The custom exception handler in `common/exceptions.py` enforces this shape
across all DRF errors automatically.

---

### 3.8 Testing

**Run all tests:**
```bash
cd backend
pytest
```

**Run a specific file:**
```bash
pytest applications/tests/test_state_machine.py -v
```

**Run a specific class:**
```bash
pytest applications/tests/test_state_machine.py::TestLegalTransitions -v
```

**Run a single test:**
```bash
pytest applications/tests/test_state_machine.py::TestLegalTransitions::test_draft_to_submitted -v
```

**Test database:**

`pytest.ini` points to `config.test_settings` which uses a separate test
Postgres database. The `appli_tracker` user must have `CREATEDB` privileges:

```sql
ALTER USER appli_tracker CREATEDB;
```

pytest-django creates `test_appli_tracker` automatically and drops it after
the run.

**Fixtures (`conftest.py`):**

| Fixture | Provides | Depends on |
|---|---|---|
| `applicant` | Saved `User` with `role=applicant` | `db` |
| `reviewer` | Saved `User` with `role=reviewer` | `db` |
| `draft_application` | `Application` in DRAFT status | `applicant` |
| `submitted_application` | `Application` in SUBMITTED status | `draft_application` |
| `under_review_application` | `Application` in UNDER_REVIEW status | `submitted_application` |
| `api_client` | Unauthenticated `APIClient` | - |
| `applicant_client` | `APIClient` authenticated as `applicant` | `api_client`, `applicant` |
| `reviewer_client` | `APIClient` authenticated as `reviewer` | `api_client`, `reviewer` |
| `other_applicant` | A second saved `User` with `role=applicant` | `db` |
| `other_application` | `Application` owned by `other_applicant` | `other_applicant` |

**What must be tested — non-negotiable:**

1. Every legal state machine transition
2. Every illegal state machine transition (must raise `TransitionNotAllowed`)
3. `FSMField(protected=True)` enforcement (must raise `AttributeError`)
4. API authorization — applicant calling reviewer endpoints → `403`
5. Unauthenticated requests → `401`
6. `reject` and `return_for_changes` without a comment body → `400`

**What is not tested:**

- Django internals (don't test that `save()` works)
- Serializer field presence (trust DRF)
- Admin interface

---

### 3.9 Common Mistakes

**Do not call transitions outside `_do_transition()`.**
The audit log write must always accompany a transition. Calling
`application.approve()` directly in a view without writing to `AuditLog`
breaks the audit trail.

**Do not use `perform_create` for the create action.**
The ViewSet uses a `create()` override that returns `ApplicationSerializer`
(full read serializer) instead of `ApplicationWriteSerializer`. Using
`perform_create` returns the write serializer which omits `id`, `status`,
and `audit_logs`.

**Do not add new apps without registering in `INSTALLED_APPS`.**
Django will silently ignore models in unregistered apps.

**Do not write migrations manually.**
Always use `python manage.py makemigrations <app>`.

**Do not add business logic to serializers.**
Serializers handle shape and validation only. Business logic (including all
transition logic) lives in views or model methods.

**Do not catch broad exceptions.**
Always catch `TransitionNotAllowed` specifically, not `Exception`.

---

## 4. Frontend

### 4.1 Stack

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **UI**: React 19+
- **Styling**: Tailwind CSS with PostCSS
- **Component Library**: Shadcn/UI
- **State Management**: Zustand
- **API Communication**: Axios
- **Form Management**: React Hook Form (implied by `use-create-application-form.ts`)
- **Tables**: TanStack Table
- **Linting**: ESLint
- **Package Manager**: pnpm

### 4.2 Setup

All frontend commands run from `frontend/`:

```bash
cd frontend

# Install dependencies
pnpm install

# Copy env file and fill in values
cp .env.example .env

# Run the development server
pnpm dev
```

The app will be available at `http://localhost:3000`.

### 4.3 Environment Variables

`.env.local` lives at `frontend/.env.local`. Never commit it.
`.env.example` is committed — always keep it in sync.

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Base URL for the Django backend API | `http://localhost:8000` |

### 4.4 Architecture

The frontend is built with Next.js using the **App Router**.

- **`app/`**: Contains all routes.
  - **Route Groups**: `(applicant)`, `(auth)`, and `(reviewer)` are used to group routes by role without affecting the URL structure. Each group has its own `layout.tsx` to provide role-specific UI shells.
  - **`layout.tsx`**: The root layout in `app/layout.tsx` wraps all pages.
  - **`page.tsx`**: The entry point for a given route.
- **`components/`**: Reusable React components.
  - **`ui/`**: Core, unstyled components from Shadcn/UI.
  - **`applications/` & `auth/`**: Domain-specific components.
- **`hooks/`**: Custom React hooks for component logic (e.g., `use-applications`).
- **`lib/`**: Utility functions and API communication.
  - **`axios.ts`**: Configures the global Axios instance with interceptors for attaching JWTs and handling 401 errors.
  - **`api/`**: Contains functions that use the Axios instance to make specific API calls.
- **`store/`**: Global state management with Zustand.
  - **`auth.ts`**: Manages user authentication state, including the user object and JWTs. It persists state to `localStorage` and also syncs the access token to cookies.
- **`src/types/api.ts`**: Contains TypeScript types automatically generated from the backend's OpenAPI schema. **Do not edit this file manually.**

### 4.5 Code Style

The project uses **ESLint** with the recommended `eslint-config-next` configuration.

- Run `pnpm lint` to check for issues.
- Adhere to the default Next.js and TypeScript best practices.

### 4.6 API & State Management

- **API Type Safety**: The `pnpm generate-types` command uses `openapi-typescript` to generate TypeScript interfaces from the backend's OpenAPI schema. This ensures that frontend API calls are type-safe. Run this command whenever the backend API changes.
- **API Calls**: All API calls are made through the configured Axios client in `lib/axios.ts`. This client automatically handles adding the `Authorization` header.
- **Global State**: The `useAuthStore` Zustand store (`store/auth.ts`) is the single source of truth for authentication state.
- **Server State**: For data fetching, the app uses custom hooks like `use-applications`, which likely wrap a library like SWR or TanStack Query under the hood (or a simple `useEffect`).

---

## 5. Git Conventions

**Branch naming:**
```
feat/<short-description>     # new feature
fix/<short-description>      # bug fix
chore/<short-description>    # config, deps, tooling
test/<short-description>     # tests only
```

**Commit messages** follow [Conventional Commits](https://www.conventionalcommits.org/):
NEVER commit anything without the user's approval. ALWAYS ask the user before you commit changes.

```
feat: add transition endpoints and audit log with atomic writes
fix: return full ApplicationSerializer from create endpoint
chore: configure Postgres via DATABASE_URL with dotenv
test: add state machine unit tests with pytest fixtures
```

**Before opening a PR:**
- [ ] `pytest` passes with no failures (backend)
- [ ] `pnpm lint` passes with no issues (frontend)
- [ ] `python manage.py check` returns no issues (backend)
- [ ] `.env.example` is updated if new env vars were added
- [ ] Migration files are included if models changed (backend)

---

## 6. Deployment

**Production stack:**

| Layer | Platform |
|---|---|
| Django API | Railway |
| PostgreSQL | Railway (same project, internal networking) |
| Next.js Frontend | Vercel |

**Railway setup (Backend):**

Set the following environment variables in the Railway dashboard:

```
SECRET_KEY=<strong-random-key>
DEBUG=False
ALLOWED_HOSTS=<your-railway-domain>.up.railway.app
DATABASE_URL=<auto-injected-by-railway>
CORS_ALLOWED_ORIGINS=https://<your-vercel-app>.vercel.app
```

`DATABASE_URL` is automatically injected by Railway when a Postgres instance
is linked to the service — no manual setup needed.

**Start command on Railway:**
```bash
python manage.py migrate && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 2
```

**Vercel setup (Frontend):**

Set the following environment variable in the Vercel project settings:

```
NEXT_PUBLIC_API_BASE_URL=https://<your-railway-domain>.up.railway.app
```

Vercel will automatically detect the Next.js project and build/deploy it.

---

*Last updated: 2026-06-28*