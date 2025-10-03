@echo off
echo.
echo ========================================
echo    📱 CHEFCODE MOBILE - SETUP RAPIDO
echo ========================================
echo.

echo ⚠️  IMPORTANTE: Prima di continuare...
echo.
echo 1. 📱 Installa "Expo Go" sul telefono
echo    iOS: App Store
echo    Android: Play Store
echo.
echo 2. 🌐 Assicurati che PC e telefono siano sulla stessa WiFi
echo.
echo 3. 🔧 Configura il tuo IP in App.js:
echo.

REM Mostra IP corrente
echo    Il tuo IP attuale è:
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4"') do echo    %%a

echo.
echo    Aggiorna questo IP nel file:
echo    frontend\mobile\src\App.js (linea 13)
echo.
set /p continue="Hai configurato l'IP? (y/n): "
if /i not "%continue%"=="y" (
    echo.
    echo ❌ Configura prima l'IP e riavvia questo script.
    pause
    exit /b 1
)

echo.
echo 🚀 Avvio setup mobile...
cd frontend\mobile

echo.
echo 📦 Verifica Expo CLI...
npx expo --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Expo CLI non trovato, installing...
    npm install -g @expo/cli
) else (
    echo ✅ Expo CLI trovato
)

echo.
echo 📦 Installazione dipendenze...
npm install

echo.
echo 🔄 Avvio app mobile...
echo 📱 Scansiona il QR code con Expo Go sul telefone
echo.
echo 🛑 Per fermare: Ctrl+C
echo.

npm start

pause