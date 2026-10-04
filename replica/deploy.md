# DEPLOYMENT & PRODUCTION RUNBOOK: ACCESSROUTE LIVE™

## 1. Production Architecture Overview
- **Frontend**: Single Page Application built with React 19 + TypeScript + Vite + Tailwind CSS v4.
- **Backend**: FastAPI Python ASGI server powered by Uvicorn.
- **Database / Spatial**: PostgreSQL 16 with PostGIS extension (or Supabase).

---

## 2. Quick-Start Local Development

### Running the Backend:
```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Start FastAPI server (Port 8000)
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Running the Frontend:
```bash
cd frontend
npm install
npm run dev
# App will run at http://localhost:5173 with proxy to backend at http://localhost:8000
```

### Running Automated Test Suite:
```bash
python -m unittest tests/test_backend.py
```

---

## 3. Production Deployment (Docker / Cloud)
```dockerfile
# Multi-stage Dockerfile
FROM node:20-alpine AS build-fe
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM python:3.10-slim
WORKDIR /app
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./backend/
COPY --from=build-fe /app/frontend/dist ./frontend/dist
CMD ["python", "-m", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```
