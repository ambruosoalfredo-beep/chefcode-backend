@echo off
REM Script per aggiornare l'URL di Render nell'app mobile
echo 🔗 ChefCode - Aggiornamento URL Backend
echo ========================================

set /p RENDER_URL="Inserisci l'URL completo di Render (es: https://chefcode-backend-abc123.onrender.com): "

if "%RENDER_URL%"=="" (
    echo ❌ URL non inserito!
    pause
    exit /b 1
)

echo 📝 Aggiornamento BackendConfig.js...

REM Backup del file originale
copy "src\BackendConfig.js" "src\BackendConfig.js.backup" >nul

REM Aggiorna l'URL nel file (usando PowerShell per sostituzione)
powershell -Command "(Get-Content 'src\BackendConfig.js') -replace 'https://chefcode-backend-XXXXX.onrender.com', '%RENDER_URL%' | Set-Content 'src\BackendConfig.js'"

if errorlevel 1 (
    echo ❌ Errore nell'aggiornamento!
    copy "src\BackendConfig.js.backup" "src\BackendConfig.js" >nul
    pause
    exit /b 1
)

echo ✅ URL aggiornato con successo!
echo 🎯 Nuovo URL: %RENDER_URL%
echo.
echo 🚀 Ora puoi buildare l'APK finale:
echo    cd .. ^&^& .\BUILD_APK.bat
echo.
pause