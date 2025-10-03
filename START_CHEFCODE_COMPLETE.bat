@echo off
echo.
echo ========================================
echo    🍳 CHEFCODE - AVVIO COMPLETO 🍳
echo ========================================
echo.

echo 1️⃣  Avvio Backend Server...
echo ⏳ Attendere avvio server...
cd backend
start "ChefCode Backend" start.bat
cd ..

echo.
echo 2️⃣  Attendere 5 secondi per il server...
timeout /t 5 /nobreak >nul

echo.
echo 3️⃣  Avvio Frontend Web...
echo 🌐 Aprendo browser...
cd frontend\web
start index.html
cd ..\..

echo.
echo ✅ ChefCode avviato con successo!
echo.
echo 📍 URLs:
echo    Backend:  http://localhost:3000
echo    Frontend: file:///.../frontend/web/index.html
echo.
echo 📱 Per l'app mobile:
echo    cd frontend/mobile
echo    npm install
echo    npm start
echo.
echo 🛑 Per fermare: Chiudi le finestre o Ctrl+C nel server
echo.
pause