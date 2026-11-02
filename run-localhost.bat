@echo off
title Smart Emergency Department - Localhost Runner
echo ========================================================
echo   Starting Smart Emergency Department on Localhost
echo ========================================================
echo.

echo [1/3] Starting Java Spring Boot Backend on http://localhost:8080 ...
start "Backend - Java Spring Boot" cmd /k "cd /d %~dp0backend && mvnw.cmd spring-boot:run"

echo [2/3] Starting React Frontend on http://localhost:5173 ...
start "Frontend - React Vite" cmd /k "cd /d %~dp0frontend && npm install && npm run dev"

echo [3/3] Waiting for services to initialize...
timeout /t 6 /nobreak >nul

echo.
echo Opening browser...
start http://localhost:5173

echo.
echo ========================================================
echo   App successfully launched!
echo   - Web Dashboard:  http://localhost:5173
echo   - Swagger API:    http://localhost:8080/swagger-ui.html
echo ========================================================
echo (Keep the two black terminal windows open while using the app)
echo Press any key to close this launcher window.
pause >nul
