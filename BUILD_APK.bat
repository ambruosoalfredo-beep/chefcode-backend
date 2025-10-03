@echo off
echo.
echo ========================================
echo    📱 CHEFCODE - BUILD APK AUTOMATICO
echo ========================================
echo.

REM Imposta variabili Java e Android SDK
set JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.16.8-hotspot
set ANDROID_HOME=C:\Users\ambru\AppData\Local\Android\Sdk
set PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\tools;%ANDROID_HOME%\platform-tools;%PATH%

set PROJECT_DIR=%~dp0frontend\mobile
set ANDROID_DIR=%PROJECT_DIR%\android

echo 🔍 Verifica progetto Android...
if not exist "%ANDROID_DIR%" (
    echo ❌ Cartella android non trovata!
    echo 💡 Esegui prima: SETUP_ANDROID_STUDIO.bat
    pause
    exit /b 1
)

echo ✅ Progetto Android trovato
echo.

echo 📦 Tipo di build:
echo   1. 🔧 Debug APK (per test)
echo   2. 🚀 Release APK (per store)
echo.
set /p build_type="Scegli (1/2): "

if "%build_type%"=="1" (
    set GRADLE_TASK=assembleDebug
    set APK_TYPE=debug
    set APK_PATH=%ANDROID_DIR%\app\build\outputs\apk\debug
    echo 🔧 Build DEBUG selezionato
) else if "%build_type%"=="2" (
    set GRADLE_TASK=assembleRelease
    set APK_TYPE=release
    set APK_PATH=%ANDROID_DIR%\app\build\outputs\apk\release
    echo 🚀 Build RELEASE selezionato
    echo ⚠️  Assicurati di aver configurato il keystore per release!
) else (
    echo ❌ Selezione non valida
    pause
    exit /b 1
)

echo.
echo 🧹 Pulizia build precedenti...
cd "%ANDROID_DIR%"
call gradlew clean
if errorlevel 1 (
    echo ❌ Errore durante pulizia
    pause
    exit /b 1
)

echo.
echo 🔨 Inizio build APK...
echo ⏱️  Questo può richiedere 3-5 minuti...
echo.

call gradlew %GRADLE_TASK%
if errorlevel 1 (
    echo.
    echo ❌ BUILD FALLITO!
    echo.
    echo 🔧 Possibili soluzioni:
    echo   1. Verifica Android Studio installato
    echo   2. Controlla ANDROID_HOME configurato
    echo   3. Riavvia come amministratore
    echo   4. Controlla logs sopra per errore specifico
    pause
    exit /b 1
)

echo.
echo ✅ BUILD COMPLETATO CON SUCCESSO!
echo.

REM Trova il file APK generato
for %%f in ("%APK_PATH%\*.apk") do set APK_FILE=%%f

if exist "%APK_FILE%" (
    echo 📱 APK generato: %APK_FILE%
    echo.
    echo 📋 Informazioni APK:
    echo    📁 Posizione: %APK_PATH%
    echo    📊 Dimensione: 
    dir "%APK_FILE%" | findstr ".apk"
    echo.
    
    echo 🚀 Prossimi passi:
    if "%APK_TYPE%"=="debug" (
        echo   1. 📱 Installa su telefono: adb install "%APK_FILE%"
        echo   2. 📤 Condividi per test
        echo   3. 🔍 Test funzionalità complete
    ) else (
        echo   1. 🏪 Upload su Google Play Console
        echo   2. 📝 Compila info store
        echo   3. 🚀 Pubblica app!
    )
    
    echo.
    set /p open_folder="Aprire cartella APK? (y/n): "
    if /i "%open_folder%"=="y" (
        explorer "%APK_PATH%"
    )
    
    echo.
    set /p install_apk="Installare APK su telefono connesso? (y/n): "
    if /i "%install_apk%"=="y" (
        echo 📱 Installazione APK...
        adb devices
        adb install "%APK_FILE%"
        if errorlevel 1 (
            echo ❌ Errore installazione. Verifica:
            echo   - Telefono connesso con USB debugging
            echo   - Driver telefono installati
            echo   - Autorizzazione debug sul telefono
        ) else (
            echo ✅ APK installato con successo!
            echo 🎉 Apri ChefCode Mobile sul telefono
        )
    )
) else (
    echo ❌ APK non trovato nella cartella attesa
    echo 🔍 Controlla manualmente in: %APK_PATH%
)

echo.
echo 📖 Per ulteriori info: docs\ANDROID_STUDIO_SETUP.md
echo.
pause