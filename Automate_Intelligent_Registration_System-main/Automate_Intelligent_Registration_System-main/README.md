Project overview

This project provides an automated registration backend + admin utilities to register users (students/attendees/employees) with:

robust validation (email, phone, DOB, custom business rules)

duplicate detection (fuzzy matching / deterministic keys)

intelligent suggestions for missing/incorrect fields (e.g., canonicalizing names)

audit trail, import/export (CSV), and an API-first design for easy integration into frontends or tests

It is intended as:

a learning/demo project for backend & QA interviews,

a minimal production template for small registration workflows, or

a foundation to add ML/NLP components (name matching, classification).

Key features

REST API for create/read/update/delete registrations

Input validation with Pydantic

Duplicate detection (exact and fuzzy)

Auto-suggestion / canonicalization for names and addresses

Bulk import (CSV) with reporting on duplicates/errors

Audit logs (who/when/what)

Authentication (token-based, basic)

Optional components:

ML/NLP model for smarter duplicate detection (trainable)

Auto-fill suggestions using simple rule-based or ML approaches

Tech stack

Python 3.10+

FastAPI (web framework)

SQLAlchemy / Alembic (ORM & migrations)

PostgreSQL (relational DB) — SQLite supported for dev/tests

Pydantic (validation & schemas)

Uvicorn (ASGI server)

pytest (testing)

Optional: Redis + Celery (background tasks), scikit-learn / fuzzywuzzy / rapidfuzz for fuzzy matching

Architecture & folder structure
intelligent-registration/
├── app/
│   ├── __init__.py
│   ├── main.py                # FastAPI app
│   ├── config.py              # settings loader from .env
│   ├── models.py              # SQLAlchemy models
│   ├── schemas.py             # Pydantic schemas
│   ├── crud.py                # DB access functions
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── registration.py    # registration endpoints
│   │   └── admin.py           # admin tasks, import/export
│   ├── services/
│   │   ├── validation.py      # business rules
│   │   └── intelligence.py    # fuzzy match / suggestions
│   ├── tasks.py               # background jobs (optional)
│   └── utils.py               # helpers (CSV, reporting)
├── alembic/                   # DB migrations (optional)
├── tests/
│   ├── conftest.py
│   └── test_registration.py
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
├── README.md
└── scripts/
    ├── seed_data.py
    └── import_csv.py

Getting started (quick setup)
Prerequisites

Python 3.10+

PostgreSQL (or use SQLite for quick dev)

(Optional) Docker & Docker Compose

1. Clone & create virtualenv
git clone <repo-url>
cd intelligent-registration
python -m venv .venv
source .venv/bin/activate     # Linux / macOS
.venv\Scripts\activate        # Windows (PowerShell)
pip install -r requirements.txt

2. Set environment variables

Create .env file (example below).

3. Run migrations (if using Alembic)
alembic upgrade head


If you don't use Alembic, create tables via SQLAlchemy: python -c "from app.models import Base; from app.database import engine; Base.metadata.create_all(engine)"

4. Start the app
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000


App will be available at http://localhost:8000. Open http://localhost:8000/docs for OpenAPI UI.

Configuration (.env example)
# .env
APP_ENV=development
DEBUG=True
DATABASE_URL=postgresql+psycopg2://postgres:password@localhost:5432/registration_db
SECRET_KEY=supersecretkey
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ADMIN_USERNAME=admin
ADMIN_PASSWORD=adminpass


For quick testing without PostgreSQL, set:

DATABASE_URL=sqlite+aiosqlite:///./dev.db

Database schema (summary)

registrations

id (uuid / serial)

first_name

last_name

email (unique-ish; validated)

phone

dob (date)

address

status (pending/confirmed/rejected)

canonical_name (for matching)

created_at, updated_at

audit_logs

id

registration_id

action (create/update/delete/import)

user

timestamp

details (json)

Indices:

index on email, phone

trigram/fuzzy index on canonical_name (Postgres pg_trgm) for fuzzy search (optional)

API endpoints & examples

All endpoints under /api/v1 (configurable)

Create registration

POST /api/v1/registrations

{
  "first_name": "Ravi",
  "last_name": "Teja",
  "email": "ravi@example.com",
  "phone": "+919876543210",
  "dob": "2000-01-01",
  "address": "Gachibowli, Hyderabad"
}


Response: created registration with id and status.

Get registration

GET /api/v1/registrations/{id}

Search & duplicate check

GET /api/v1/registrations/search?q=ravi+teja&fuzzy=true&threshold=80

Bulk import (CSV)

POST /api/v1/admin/import (multipart file upload)
Returns report: created_count, duplicates_count, errors[]

Update status

PATCH /api/v1/registrations/{id}/status
Body: { "status": "confirmed" }

Example curl — create
curl -X POST http://localhost:8000/api/v1/registrations \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Ravi","last_name":"Teja","email":"ravi@example.com","phone":"+919876543210","dob":"2000-01-01"}'

Intelligent features — how they work

This section explains the built-in "intelligence" and how to extend it.

1. Validation & canonicalization

Names are normalized to remove extra spaces, unify case, and transliteration (if needed).

Emails and phones validated via regex and normalization utility.

canonical_name = normalized first_name + last_name (used for fast exact matching and fuzzy matching).

2. Duplicate detection

Deterministic checks: exact email match, exact phone match.

Fuzzy checks: use a fuzzy string matcher (e.g., rapidfuzz or python-Levenshtein) on canonical_name plus similarity on email local-part.

threshold parameter controls sensitivity (e.g., 85–90 for tight matches).

3. Suggestions / Auto-fill

If address components are missing, system uses heuristics to suggest (e.g., common city names).

ML option: integration point for a small classifier or embedding model to suggest likely duplicates or fill missing fields. Included as optional services/intelligence.py with a simple rule-based fallback.

4. Background processing

Bulk imports and heavy matching can run asynchronously (Celery + Redis). This is optional and pluggable.

Testing

Use pytest and a test DB (SQLite recommended in CI).

Install test requirements:

pip install -r dev-requirements.txt


Run tests:

pytest -q


Suggested tests:

validation rules (email, phone, dob)

duplicate detection logic (unit tests for threshold and detection)

API integration tests (create, fetch, search, bulk import)

Deployment (Docker Compose)

A docker-compose.yml (example) can spin up web + postgres:

version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: registration_db
    volumes:
      - db-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  web:
    build: .
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    volumes:
      - ./:/usr/src/app
    ports:
      - "8000:8000"
    depends_on:
      - db
    environment:
      DATABASE_URL: postgresql+psycopg2://postgres:password@db:5432/registration_db
      SECRET_KEY: supersecretkey

volumes:
  db-data:


Start:

docker-compose up --build

Extending the system / Ideas

Add role-based access control for admin users.

Replace rule-based fuzzy matching with an embedding + nearest-neighbor search for multilingual names.

Add OTP-based phone verification or email verification flow.

Build a React/Vue frontend with live validation and suggestions.

Add analytics dashboard for registrations and import error rates.

Use Postgres pg_trgm extension & GIN indexes to accelerate fuzzy search.

Troubleshooting & tips

If duplicate detection is too aggressive, raise the similarity threshold to 90+.

For local dev without Postgres, use SQLite by setting DATABASE_URL=sqlite+aiosqlite:///./dev.db.

If using Docker, ensure ports 5432 & 8000 are free.

For heavy bulk imports, prefer background processing (Celery) to avoid blocking the request.

Contributing

Fork the repo

Create a feature branch: git checkout -b feat/<your-feature>

Run tests and add new tests for your feature

Open a Pull Request with a clear description

Please follow code style (black, isort) and write unit tests for core logic.
