@echo off
echo.
echo ========================================
echo   🍽️  CHEFCODE - Avvio Server AI  🍽️
echo ========================================
echo.

echo Controllo Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js non trovato!
    echo Scarica Node.js da: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js trovato!
echo.

echo Controllo dipendenze...
if not exist "node_modules" (
    echo 📦 Installazione dipendenze...
    npm install
    echo.
)

echo 🚀 Avvio ChefCode Server...
echo.
echo 💡 Suggerimenti:
echo    - Server disponibile su: http://localhost:3000
echo    - Apri index.html nel browser
echo    - Premi Ctrl+C per fermare il server
echo.
echo ========================================
echo.

node server.js

pause