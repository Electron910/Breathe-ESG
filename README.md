# Breathe ESG

Breathe ESG is a full-stack, multi-tenant carbon emissions data management platform. It is designed to allow enterprise analysts to easily ingest raw ESG (Environmental, Social, and Governance) data via CSV, parse it dynamically through configurable data sources, and review it for accuracy. It features strict Role-Based Access Controls (RBAC) ensuring that analysts can only prepare the data, while administrators have the sole authority to approve and lock the records for final auditing. 

The application is wrapped in a highly-stylized, retro-terminal "System Access Protocol" aesthetic.

## Features

- **Multi-Tenant Architecture:** Securely isolate data by company (tenant).
- **Dynamic Data Ingestion:** Upload CSVs for various sources (e.g., SAP, Travel, Utilities) mapping columns dynamically to calculate total CO2e footprints.
- **Data Validation & Review Workflow:** Data is flagged automatically (Pending, Suspicious, Error). Review interfaces allow for line-by-line inspection of raw versus parsed data.
- **Role-Based Access Control (RBAC):** Strict separation of duties. Analysts upload and monitor. Admins review, approve, reject, and lock records.
- **Immutable Auditing:** Once records are approved and locked, they cannot be edited, establishing a secure provenance trail for compliance exports.
- **Retro Terminal Aesthetic:** Custom-styled dark layouts and pixelated inputs for an engaging user experience.

---

## Tech Stack

### Frontend
- **React.js (Vite)**
- **Tailwind CSS** (for styling)
- **React Router** (for navigation)
- **Axios** (for API communication)
- **Lucide React** (for iconography)

### Backend
- **Python / Django**
- **Django Rest Framework (DRF)**
- **PostgreSQL** (Production) / **SQLite** (Local Development)
- **Simple JWT** (Token-based Authentication)

---

## Local Development Setup

### 1. Backend Setup (Django)

1. Navigate to the backend directory:
   ```bash
   cd breathe_esg_backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the database migrations:
   ```bash
   python manage.py migrate
   ```
5. (Optional) Generate sample data (Note: Make sure a tenant exists first, see API setup below):
   ```bash
   python generate_sample_data.py
   ```
6. Start the local development server:
   ```bash
   python manage.py runserver
   ```
   *The API will be available at `http://localhost:8000`*

### 2. Frontend Setup (React)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd breathe_esg_frontend
   ```
2. Install the Node modules:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The UI will be available at `http://localhost:5173`*

### 3. First-Time Setup (Creating an Admin Account)
Since the app uses multi-tenancy, you must create a Tenant and an Admin user before you can log in. Use `curl` or Postman to send a setup request to the local backend:

```bash
curl -X POST http://localhost:8000/api/setup/ \
-H "Content-Type: application/json" \
-d '{"company_name": "My Local Corp", "email": "admin@local.com", "password": "password123"}'
```
You can now log in at `http://localhost:5173` using `admin@local.com` and `password123`.

---

## Deployment Guide (Render)

The project is fully prepared for deployment on [Render](https://render.com/).

### 1. Deploy the Backend (Web Service)
1. In Render, create a **New Web Service** linked to your GitHub repository.
2. Set **Root Directory** to `breathe_esg_backend`.
3. Set **Build Command** to `./build.sh`
4. Set **Start Command** to `gunicorn breathe_esg.wsgi:application --bind 0.0.0.0:$PORT`
5. Create a **New PostgreSQL** database on Render and copy its Internal URL.
6. Add the following Environment Variables in the Web Service advanced settings:
   - `DJANGO_SETTINGS_MODULE` = `breathe_esg.settings.prod`
   - `SECRET_KEY` = `<generate-a-secure-random-string>`
   - `DATABASE_URL` = `<your-render-internal-postgres-url>`
   - `ALLOWED_HOSTS` = `your-backend-app-name.onrender.com`
   - `CORS_ALLOWED_ORIGINS` = `https://your-frontend-app-name.onrender.com`

### 2. Deploy the Frontend (Static Site)
1. In Render, create a **New Static Site** linked to the same repository.
2. Set **Root Directory** to `breathe_esg_frontend`.
3. Set **Build Command** to `npm install && npm run build`
4. Set **Publish Directory** to `dist`
5. Add the following Environment Variable:
   - `VITE_API_URL` = `https://your-backend-app-name.onrender.com` *(No trailing slash)*

### 3. Post-Deployment
1. Make sure to update `CORS_ALLOWED_ORIGINS` in your Backend settings if your Frontend URL changed.
2. Run the First-Time Setup `curl` command against your live production backend URL to create your first Admin user!
