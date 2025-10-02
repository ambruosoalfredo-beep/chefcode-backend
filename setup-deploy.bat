@echo off
REM ChefCode Backend - Quick Deploy Setup for Windows
echo 🚀 ChefCode Backend - Setup per Render Deployment
echo =================================================

REM Controlla se siamo nella directory corretta
if not exist "server.js" (
    echo ❌ Errore: Esegui questo script dalla directory backend/
    pause
    exit /b 1
)

if not exist "package.json" (
    echo ❌ Errore: package.json non trovato
    pause
    exit /b 1
)

echo 📋 Controlli preliminari...

REM Controlla Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js non trovato. Installa Node.js 18+ prima di continuare.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js trovato: %NODE_VERSION%

REM Controlla npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm non trovato.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm trovato: %NPM_VERSION%

REM Installa dipendenze
echo 📦 Installazione dipendenze...
call npm install

if errorlevel 1 (
    echo ❌ Errore nell'installazione delle dipendenze
    pause
    exit /b 1
)
echo ✅ Dipendenze installate con successo

REM Test del server (opzionale su Windows per semplicità)
echo 🧪 Per testare il server: npm start (in un altro terminale)

REM Controlla Git
if not exist ".git" (
    echo 📝 Inizializzo repository Git...
    git init
    git add .
    git commit -m "Initial backend setup for Render deployment"
    echo ✅ Repository Git inizializzato
) else (
    echo ✅ Repository Git già presente
)

echo.
echo 🎉 Setup completato con successo!
echo.
echo 📋 Prossimi passi:
echo 1. 🌐 Vai su https://render.com e crea un account
echo 2. 📤 Push questo codice su GitHub/GitLab:
echo    git remote add origin https://github.com/USERNAME/chefcode-backend.git
echo    git push -u origin main
echo 3. 🚀 Crea un Web Service su Render collegando il tuo repository
echo 4. ⚙️  Configura le variabili d'ambiente:
echo    - NODE_ENV=production
echo    - OPENAI_API_KEY=la-tua-api-key
echo    - ALLOWED_ORIGINS=*
echo 5. 📱 Aggiorna l'URL nell'app mobile
echo.
echo 📖 Documentazione completa: docs/RENDER_DEPLOYMENT.md
echo.
pause