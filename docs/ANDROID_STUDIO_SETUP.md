# 📱 ChefCode Android Studio - APK Build Guide

## 🎯 Strategia: React Native → Android Studio → APK

### Vantaggi:
✅ **Riutilizzi codice** React Native esistente  
✅ **Build APK nativo** con Android Studio  
✅ **Performance ottimizzata** rispetto a Expo  
✅ **Controllo completo** build process  
✅ **Store-ready** per Google Play  

## 📋 **PARTE 1: Setup Android Studio**

### 1️⃣ **Download e Installazione**
```
🔗 https://developer.android.com/studio
📥 Scarica Android Studio (3+ GB)
💿 Installa con impostazioni default
⏱️ Tempo: ~30 minuti
```

### 2️⃣ **Configurazione SDK**
```
🔧 Android Studio → Settings → Appearance → System Settings → Android SDK
📦 SDK Platforms:
   ✅ Android 13 (API 33) - Latest
   ✅ Android 11 (API 30) - Compatibility
   ✅ Android 9 (API 28) - Minimum

📦 SDK Tools:
   ✅ Android SDK Build-Tools
   ✅ Android Emulator
   ✅ Android SDK Platform-Tools
   ✅ Intel x86 Emulator Accelerator
```

### 3️⃣ **Variabili Ambiente Windows**
```cmd
# Aggiungi al PATH di sistema:
C:\Users\%USERNAME%\AppData\Local\Android\Sdk\platform-tools
C:\Users\%USERNAME%\AppData\Local\Android\Sdk\tools

# Crea variabile ANDROID_HOME:
ANDROID_HOME = C:\Users\%USERNAME%\AppData\Local\Android\Sdk
```

### 4️⃣ **Test Installazione**
```bash
# Apri cmd e testa:
adb version
# Deve mostrare: Android Debug Bridge version X.X.X
```

## 📋 **PARTE 2: Conversione Progetto**

### 🚀 **Metodo 1: Expo Eject (da React Native esistente)**

```bash
cd "C:\Users\ambru\Desktop\CHEFCODE\chefcode APP\CHEFCODE LAVORI IN CORSO\frontend\mobile"

# Eject da Expo a bare React Native
npx expo eject

# Scegli:
# ❓ What would you like your Android package name to be?
# ✅ com.chefcode.mobile

# ❓ What would you like your iOS bundle identifier to be?  
# ✅ com.chefcode.mobile
```

### 🔧 **Post-Eject Setup**
```bash
# Installa dipendenze native
npm install

# Setup Android
cd android
.\gradlew clean
cd ..

# Test build
npx react-native run-android
```

### 🚀 **Metodo 2: Nuovo Progetto React Native CLI (Alternative)**

```bash
# Crea nuovo progetto da zero
npx react-native init ChefCodeMobile --version latest

# Copia il codice dall'app Expo
# Sposta: src/App.js → ChefCodeMobile/App.js
# Sposta: shared/ → ChefCodeMobile/shared/
```

## 📋 **PARTE 3: Android Studio Setup**

### 1️⃣ **Apri Progetto**
```
🔧 Android Studio → Open an Existing Project
📁 Naviga a: ...\frontend\mobile\android
✅ Seleziona cartella "android"
⏱️ Primo sync: 5-10 minuti
```

### 2️⃣ **Configurazione Build**
```gradle
// File: android/app/build.gradle

android {
    compileSdkVersion 33
    buildToolsVersion "33.0.0"
    
    defaultConfig {
        applicationId "com.chefcode.mobile"
        minSdkVersion 21
        targetSdkVersion 33
        versionCode 1
        versionName "1.0.0"
        multiDexEnabled true
    }
    
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.debug // Per test, sostituisci con release per store
        }
    }
}
```

### 3️⃣ **Permessi App**
```xml
<!-- File: android/app/src/main/AndroidManifest.xml -->

<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.VIBRATE" />
```

## 📋 **PARTE 4: Build APK**

### 🔨 **Build Debug APK (Per Test)**
```bash
# Metodo 1: Da terminale
cd android
.\gradlew assembleDebug

# APK generato in:
# android\app\build\outputs\apk\debug\app-debug.apk
```

```
🔧 Metodo 2: Da Android Studio
Build → Build Bundle(s) / APK(s) → Build APK(s)
⏱️ Tempo build: 3-5 minuti
📁 Trova APK in: app/build/outputs/apk/debug/
```

### 🚀 **Build Release APK (Per Store)**

#### **1. Genera Keystore**
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore chefcode-release-key.keystore -alias chefcode-key-alias -keyalg RSA -keysize 2048 -validity 10000

# Inserisci password sicura e info app
```

#### **2. Configura Signing**
```gradle
// File: android/app/build.gradle

android {
    ...
    signingConfigs {
        release {
            storeFile file('chefcode-release-key.keystore')
            storePassword 'TUA_PASSWORD'
            keyAlias 'chefcode-key-alias'  
            keyPassword 'TUA_PASSWORD'
        }
    }
    buildTypes {
        release {
            ...
            signingConfig signingConfigs.release
        }
    }
}
```

#### **3. Build Release**
```bash
cd android
.\gradlew assembleRelease

# APK produzione in:
# android\app\build\outputs\apk\release\app-release.apk
```

## 📋 **PARTE 5: Personalizzazione App**

### 🎨 **Icon e Branding**
```
📁 android/app/src/main/res/
├── mipmap-hdpi/ic_launcher.png (72x72)
├── mipmap-mdpi/ic_launcher.png (48x48)  
├── mipmap-xhdpi/ic_launcher.png (96x96)
├── mipmap-xxhdpi/ic_launcher.png (144x144)
└── mipmap-xxxhdpi/ic_launcher.png (192x192)

🔧 Usa il logo ChefCode esistente
📐 Crea 5 versioni diverse risoluzioni
```

### 📝 **App Name**
```xml
<!-- File: android/app/src/main/res/values/strings.xml -->
<resources>
    <string name="app_name">ChefCode Mobile</string>
</resources>
```

### 🎨 **Splash Screen**
```xml
<!-- File: android/app/src/main/res/drawable/launch_screen.xml -->
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/primary_dark" />
    <item>
        <bitmap
            android:gravity="center"
            android:src="@drawable/logo" />
    </item>
</layer-list>
```

## 🧪 **PARTE 6: Test APK**

### 📱 **Installazione Test**
```bash
# Connetti telefono con USB debugging abilitato
adb devices

# Installa APK  
adb install android\app\build\outputs\apk\debug\app-debug.apk

# Oppure copia APK su telefono e installa manualmente
```

### ✅ **Checklist Test**
- [ ] App si avvia senza crash
- [ ] Chat AI funziona (con backend avviato)
- [ ] Inventario sincronizza
- [ ] Permessi microfono richiesti correttamente
- [ ] Connessione server verificata
- [ ] UI responsive su diversi schermi

## 🚀 **PARTE 7: Ottimizzazioni**

### ⚡ **Performance**
```gradle
// android/app/build.gradle
android {
    ...
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 📦 **Dimensioni APK**
```gradle
// Abilita code splitting per architetture
android {
    ...
    splits {
        abi {
            enable true
            reset()
            include "x86", "armeabi-v7a", "arm64-v8a"
            universalApk false
        }
    }
}
```

## 🏪 **PARTE 8: Pubblicazione Google Play**

### 📋 **Preparazione Store**
1. **Account Developer** ($25 una tantum)
2. **Privacy Policy** (obbligatorio)
3. **Screenshots** app (min 2)
4. **Descrizione** store
5. **APK firmato** con release keystore

### 📱 **Upload Console**
```
🔗 https://play.google.com/console
📤 Upload APK release
📝 Compila info store
🔍 Review Google (24-48h)
🚀 Pubblicazione!
```

---

## ⚠️ **TROUBLESHOOTING**

### ❌ **"SDK not found"**
```bash
# Verifica ANDROID_HOME
echo %ANDROID_HOME%

# Reinstalla SDK da Android Studio
```

### ❌ **"Build failed"**
```bash
# Pulisci build
cd android
.\gradlew clean
.\gradlew assembleDebug
```

### ❌ **"App crashes on startup"**
```bash
# Controlla logs
adb logcat | findstr ChefCode
```

### ❌ **"Metro bundler not found"**
```bash
# Reset React Native
npx react-native start --reset-cache
```

---

## 🎯 **QUICK START COMMANDS**

```bash
# 1. Setup iniziale (una volta)
npx expo eject
cd android
gradlew clean

# 2. Build APK debug (per test)  
gradlew assembleDebug

# 3. Installa su telefono
adb install app\build\outputs\apk\debug\app-debug.apk

# 4. Build APK release (per store)
gradlew assembleRelease
```

---

**📱 Risultato finale: APK nativo pronto per Google Play Store! 🚀**