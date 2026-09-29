@echo off
echo ============================================================
echo   Starting UdyamSathi Platform (SIH26092)
echo ============================================================
echo.

cd /d "%~dp0"

echo [1/2] Starting FastAPI Backend on port 8001...
start "UdyamSathi Backend (FastAPI)" cmd /k "cd backend && .\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload"

echo [2/2] Starting Next.js Frontend on port 3000...
start "UdyamSathi Frontend (Next.js)" cmd /k "cd frontend && npx next dev -p 3000"

echo.
echo All services are launching:
echo   - Frontend: http://localhost:3000
echo   - Backend:  http://localhost:8001
echo   - API Docs: http://localhost:8001/docs
echo.
pause
