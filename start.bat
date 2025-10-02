@echo off
echo 🚀 Avvio ChefCode Backend Server...
echo.

REM Controlla se Node.js è installato
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERRORE: Node.js non trovato!
    echo.
    echo 📥 Scarica e installa Node.js da: https://nodejs.org/
    echo    Versione consigliata: LTS ^(Long Term Support^)
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js trovato: 
node --version

echo.
echo 📦 Installazione dipendenze...
npm install

echo.
echo 🔧 Configurazione...
if not exist "config.json" (
    echo ⚠️  File config.json non trovato, creazione automatica...
    echo {
    echo   "apiKey": "LA_TUA_API_KEY_QUI",
    echo   "instructions": {
    echo     "step1": "Vai su https://platform.openai.com/api-keys",
    echo     "step2": "Crea un nuovo progetto e genera una API key",
    echo     "step3": "Sostituisci 'LA_TUA_API_KEY_QUI' nel file server.js linea 18"
    echo   },
    echo   "note": "⚠️ Non condividere mai la tua API key!"
    echo } > config.json
)

echo.
echo 🌐 Avvio server...
echo 📍 URL: http://localhost:3000
echo 🛑 Per fermare: Ctrl+C
echo.

node server.js

pause