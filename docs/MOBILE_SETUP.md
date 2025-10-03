# 📱 ChefCode Mobile - Setup Completo

## 🚀 Setup React Native + Expo

### 1️⃣ **Prerequisiti**
```bash
# Installa Node.js (LTS)
https://nodejs.org/

# Installa Expo CLI globalmente
npm install -g @expo/cli

# Installa Expo Go app sul telefono
iOS: App Store → "Expo Go"
Android: Play Store → "Expo Go"
```

### 2️⃣ **Setup Progetto**
```bash
cd "c:\Users\ambru\Desktop\CHEFCODE\chefcode APP\CHEFCODE LAVORI IN CORSO\frontend\mobile"

# Installa dipendenze
npm install

# Verifica installazione
npx expo --version
```

### 3️⃣ **Configurazione IP Server**
⚠️ **IMPORTANTE**: Aggiorna l'IP del tuo PC nel file App.js

**Trova il tuo IP:**
```bash
# Windows
ipconfig

# Cerca "Indirizzo IPv4" della tua scheda WiFi
# Esempio: 192.168.1.105
```

**Aggiorna App.js:**
```javascript
// Linea 13 in frontend/mobile/src/App.js
const [serverIP, setServerIP] = useState('192.168.1.105'); // ← IL TUO IP QUI
```

### 4️⃣ **Avvio Applicazione**

**Terminal 1 - Backend:**
```bash
cd backend
start.bat
# Server deve essere su http://TUO_IP:3000
```

**Terminal 2 - Mobile:**
```bash
cd frontend/mobile
npm start
# Si apre Expo Dev Tools
```

**Sul telefono:**
1. Apri **Expo Go**
2. Scansiona il **QR code** mostrato nel terminal
3. App si carica automaticamente

## 🔧 Troubleshooting

### ❌ **"Server non raggiungibile"**

**Causa**: IP non corretto o rete diversa

**Soluzioni**:
1. **Verifica IP**: `ipconfig` → aggiorna App.js
2. **Stessa rete**: PC e telefono sulla stessa WiFi  
3. **Firewall**: Disabilita temporaneamente Windows Firewall
4. **Test browser**: Apri `http://TUO_IP:3000/api/data` sul telefono

### ❌ **"Cannot resolve module"**

**Causa**: Percorsi import non corretti

**Soluzioni**:
```bash
# Pulisci cache
npx expo r -c

# Reinstalla
rm -rf node_modules
npm install
```

### ❌ **"Metro bundler failed"**

**Causa**: Conflitti cache o dipendenze

**Soluzioni**:
```bash
# Reset Expo
npx expo r -c

# Reset cache npm
npm start -- --reset-cache
```

### ❌ **"Network response timed out"**

**Causa**: Server backend non avviato

**Soluzioni**:
1. Avvia `backend/start.bat`
2. Verifica console per errori
3. Testa `http://localhost:3000` in browser

### ❌ **"Microphone permission denied"**

**Causa**: Permessi audio non concessi

**Soluzioni**:
1. **Android**: Impostazioni → App → Expo Go → Permessi → Microfono ✅
2. **iOS**: Impostazioni → Privacy → Microfono → Expo Go ✅

## 📊 Test Funzionalità

### ✅ **Test Connessione**
1. Apri app mobile
2. Header deve mostrare "🟢 Server connesso"
3. Se "🔴 Modalità offline" → controlla IP/WiFi

### ✅ **Test Chat AI**
1. Scrivi: "Ciao, come stai?"
2. Tap ✈️ (invio)
3. Verifica risposta AI

### ✅ **Test Inventario**
1. Tap "⚡ Aggiungi" in sezione Inventario  
2. Scrivi: "2 kg pasta 3€"
3. Verifica item appare in lista

### ✅ **Test Vocale** (Demo)
1. Tap 🎤 in chat
2. Diventa 🎙️ per 2 secondi
3. Genera comando demo automatico

## 🎯 Funzionalità App Mobile

### 🤖 **Chat AI**
- ✅ Invio messaggi ChatGPT
- ✅ Parsing comandi italiani
- ✅ Sincronizzazione inventario
- ✅ Modalità offline

### 📦 **Inventario**  
- ✅ Visualizzazione items
- ✅ Aggiunta manuale
- ✅ Sincronizzazione server
- ✅ Storage locale (offline)

### 📝 **Ricette**
- ✅ Lista ricette configurate
- ✅ Conteggio ingredienti
- ⏳ Editor ricette (futuro)

### 🔄 **Sincronizzazione**
- ✅ **Pull-to-refresh** (trascina in basso)
- ✅ **Auto-sync** al caricamento
- ✅ **Offline-first** (storage locale prioritario)
- ✅ **Status indicator** (connesso/offline)

## 🏗️ Build per Store

### **Build Android APK**
```bash
# Setup EAS (Expo Application Services)
npm install -g @expo/eas-cli
eas login

# Build APK
eas build --platform android --profile development

# Scarica APK generato
```

### **Build iOS IPA**
```bash
# Richiede Apple Developer Account ($99/anno)
eas build --platform ios --profile development
```

### **Publish su Store**
```bash
# Build produzione
eas build --platform all --profile production

# Submit agli store
eas submit --platform android
eas submit --platform ios
```

## 📋 Checklist Pre-Release

- [ ] ✅ Backend funzionante e testato
- [ ] ✅ IP server configurato correttamente  
- [ ] ✅ App carica su Expo Go
- [ ] ✅ Chat AI risponde
- [ ] ✅ Inventario sincronizza
- [ ] ✅ Modalità offline funziona
- [ ] ✅ Permessi microfono concessi
- [ ] ✅ Pull-to-refresh attivo
- [ ] ✅ Gestione errori robusta

## 🚀 Next Steps

### **Prossime funzionalità:**
1. **🔐 Autenticazione** - Login utenti
2. **📸 Camera scanner** - Barcode ingredienti  
3. **🔊 Speech-to-text** - Riconoscimento vocale reale
4. **📈 Analytics** - Metriche utilizzo
5. **🔔 Push notifications** - Avvisi produzione
6. **☁️ Backend cloud** - Server remoto

### **Miglioramenti UI:**
1. **🎨 Tema scuro/chiaro**
2. **📱 Navigazione tab** - Sezioni separate
3. **✨ Animazioni** - Feedback visivo
4. **📊 Dashboard** - Grafici inventario
5. **🔍 Ricerca avanzata** - Filtri smart

---

## 📞 Supporto

### **Problemi comuni:**
1. **IP sbagliato** → `ipconfig` + aggiorna App.js
2. **Rete diversa** → Stesso WiFi PC/mobile
3. **Cache corrotta** → `npx expo r -c`
4. **Server offline** → `backend/start.bat`

### **Log debug:**
```bash
# Console app mobile
npx expo logs

# Console backend
# Vedi terminal dove gira start.bat
```

**📧 Per assistenza**: Controlla console errors e condividi screenshot! 

---

*ChefCode Mobile v1.0 - React Native + Expo 📱*