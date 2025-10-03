@echo off
echo.
echo ========================================
echo   📱 CHEFCODE - ANDROID STUDIO SETUP
echo ========================================
echo.

echo ⚠️  ATTENZIONE: Questo script convertirà il progetto da Expo a React Native bare
echo    - Non potrai più usare Expo Go  
echo    - Dovrai usare Android Studio per build
echo    - Processo NON reversibile
echo.

set /p continue="Continui con la conversione? (y/n): "
if /i not "%continue%"=="y" (
    echo ❌ Conversione annullata.
    pause
    exit /b 1
)

echo.
echo 🚀 Inizio conversione Expo → React Native...

cd frontend\mobile

echo.
echo 📦 Verifica dipendenze...
npm install

echo.
echo 🔄 Eject da Expo (questo può richiedere alcuni minuti)...
echo.
echo ❓ Ti verranno chieste alcune domande:
echo    - Android package name: com.chefcode.mobile
echo    - iOS bundle identifier: com.chefcode.mobile
echo.

npx expo eject

if errorlevel 1 (
    echo ❌ Errore durante eject!
    echo 💡 Prova manualmente: cd frontend\mobile && npx expo eject
    pause
    exit /b 1
)

echo.
echo ✅ Eject completato!
echo.
echo 📁 Nuova struttura:
echo    ├── android\     ← Progetto Android Studio
echo    ├── ios\         ← Progetto Xcode (iOS)  
echo    ├── src\         ← Codice JavaScript
echo    └── package.json ← Dipendenze aggiornate
echo.

echo 🔧 Setup Android dependencies...
cd android
gradlew clean
if errorlevel 1 (
    echo ⚠️  Gradle clean failed - normale per prima volta
    echo    Installa Android Studio prima di continuare
)
cd ..

echo.
echo ✅ CONVERSIONE COMPLETATA!
echo.
echo 📋 PROSSIMI PASSI:
echo.
echo 1. 📥 Installa Android Studio da: https://developer.android.com/studio
echo.
echo 2. 🔧 Apri progetto in Android Studio:
echo    File → Open → Seleziona cartella: frontend\mobile\android
echo.
echo 3. ⏱️  Attendi sync iniziale (5-10 min)
echo.
echo 4. 🔨 Build APK:
echo    Build → Build Bundle(s) / APK(s) → Build APK(s)
echo.
echo 5. 📱 APK generato in:
echo    android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo 📖 Guida completa: docs\ANDROID_STUDIO_SETUP.md
echo.

pause