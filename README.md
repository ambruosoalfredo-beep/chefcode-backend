# ️ ChefCode v2.0 - Restaurant Management Platform

**Piattaforma completa di gestione ristorante con intelligenza artificiale integrata**

## 🎯 **VERSIONE v2.0 - STABILE E SICURA**

**✅ STATUS: COMPLETAMENTE FUNZIONANTE**
- � **Sicurezza**: API keys protette con environment variables
- 📱 **Mobile**: UI responsive perfetta, nessun overflow
- 🤖 **AI Chat**: ChatGPT integrato e funzionante al 100%
- 🚀 **Deploy**: Render ready con configurazione ottimizzata
- 📦 **APK**: Capacitor configurato per iOS/Android

## ✨ Caratteristiche principali

### 🏪 Gestione Completa
- **Goods In**: Gestione inventario con scanner OCR e input vocale

│   ├── package.json        # Dipendenze Node.js- **Recipe Set-Up**: Configurazione ricette e calcolo costi

│   ├── config.json         # Configurazione OpenAI- **Production**: Pianificazione produzione giornaliera

│   └── start.bat          # Script avvio server- **Sales**: Gestione vendite e reportistica

│

├── 📁 frontend/            # Applicazioni Client### 🤖 Intelligenza Artificiale

│   ├── 📁 web/            # Versione Web (HTML/CSS/JS)- **ChatGPT integrato** con contesto del ristorante

│   │   ├── index.html     # Interfaccia web principale- **Comandi vocali intelligenti** in italiano

│   │   ├── script.js      # Logica frontend web- **Riconoscimento automatico** ingredienti e quantità

│   │   ├── style.css      # Stili web- **Suggerimenti ricette** basati sull'inventario disponibile

│   │   └── logo.svg       # Logo aziendale

│   │---

│   ├── 📁 mobile/         # App Mobile (React Native)

│   │   ├── src/           # Codice sorgente mobile## 🚀 Installazione Rapida

│   │   ├── assets/        # Risorse mobile

│   │   └── package.json   # Dipendenze React Native### 1️⃣ Prerequisiti

│   │- **Node.js** (versione 14 o superiore) - [Scarica qui](https://nodejs.org/)

│   └── 📁 shared/         # Codice condiviso- **Account OpenAI** per l'API ChatGPT - [Registrati qui](https://platform.openai.com/)

│       ├── api.js         # Layer API unificato

│       └── utils.js       # Utility condivise### 2️⃣ Setup del progetto

│

└── 📁 docs/               # Documentazione```bash

    ├── README.md          # Documentazione principale# 1. Apri il terminale nella cartella del progetto

    ├── QUICK_START.md     # Guida avvio rapidocd "percorso/alla/cartella/ChefCode"

    └── DEBUG_*.txt        # Guide troubleshooting

```# 2. Installa le dipendenze (se non presenti)

npm install

## 🚀 Avvio Rapido

# 3. Avvia il server

### 1️⃣ Avvia Backendnode server.js

```bash```

cd backend

double-click start.bat### 3️⃣ Configurazione API OpenAI

```

**⚠️ IMPORTANTE**: Prima di usare l'AI devi configurare la tua API key.

### 2️⃣ Configurazione API OpenAI

#### 📍 **Setup Locale**
1. Vai su [OpenAI Platform](https://platform.openai.com/api-keys)
2. Crea una nuova API key
3. Copia il file `.env.example` in `.env` nella cartella `backend/`
4. Sostituisci `your_openai_api_key_here` con la tua API key reale

#### 🚀 **Setup su Render (Deploy)**
1. Vai nel tuo dashboard Render
2. Seleziona il tuo servizio ChefCode
3. Vai su **Environment**
4. Aggiungi nuova variabile:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: `la_tua_api_key_openai`
5. Fai **Deploy** per applicare le modifiche

### 3️⃣ Avvia Frontend Web

```bash
cd www
python -m http.server 8080
```

### 3️⃣ App Mobile (React Native)

cd frontend/mobile

npm install### 4️⃣ Avvio dell'applicazione

npm start

```1. **Avvia il server**: `node server.js`

2. **Apri il browser**: vai su `http://localhost:3000`

## 🎯 Funzionalità3. **Apri**: `index.html` nel browser



### 🤖 **AI Integrata**---

- **ChatGPT intelligente** per gestione ristorante

- **Riconoscimento vocale** italiano## 🎯 Come usare l'AI

- **Parsing automatico** ingredienti e quantità

- **Sincronizzazione** tempo reale### 💬 Chat Intelligente (Footer)

- **Scrivi** una domanda nel campo input

### 📦 **Gestione Inventario**- **Clicca** l'aeroplano per inviare

- Aggiunta ingredienti **vocale** e **manuale**- **Usa il microfono** per messaggi vocali

- **Calcolo automatico** costi totali- **Clicca il +** per caricare file (in sviluppo)

- **Categorizzazione** intelligente

- **Ricerca e filtri** avanzati### 🗣️ Comandi Vocali Intelligenti

**Esempi di comandi che l'AI capisce:**

### 📝 **Ricette e Produzione**

- **Editor ricette** con ingredienti```

- **Pianificazione produzione** con task"Aggiungi 5 kg di pomodori al costo di 2.50 euro"

- **Calcolo costi** ricette automatico"Cosa posso cucinare?"

- **Scalatura inventario** per produzione"Suggerisci una ricetta con pasta"

"Quanto costa fare 10 porzioni di carbonara?"

### 📱 **Multi-Piattaforma**```

- **Web App** completa (desktop/mobile)

- **App Mobile** nativa (iOS/Android)### 🎙️ Parser Vocale (Destra)

- **API unificata** per tutte le piattaforme- **Clicca il microfono** per comandi inventario

- **Sincronizzazione** cross-device- **Parla chiaramente** in italiano

- **Risultati automatici** nell'inventario

## 🔧 Configurazione

---

### Backend Setup

1. **Node.js**: Installa da https://nodejs.org/## 🛠️ Risoluzione Problemi

2. **API Key**: Configura OpenAI in `backend/server.js` linea 18

3. **CORS**: Pre-configurato per mobile e web### ❌ "Error: Failed to fetch"

- **Causa**: Server non avviato

### Mobile Setup- **Soluzione**: Esegui `node server.js` nel terminale

1. **Expo CLI**: `npm install -g @expo/cli`

2. **IP Server**: Aggiorna IP in `mobile/src/App.js` linea 13### ❌ "No response" o errori API

3. **Dipendenze**: `npm install` nella cartella mobile- **Causa**: API key non configurata/errata

- **Soluzione**: Verifica la tua API key OpenAI in `server.js`

## 🌐 Endpoint API

### ❌ Riconoscimento vocale non funziona

### Base URL: `http://localhost:3000`- **Causa**: Browser non supporta o microfono negato

- **Soluzione**: Usa Chrome/Edge e consenti accesso microfono

| Endpoint | Metodo | Descrizione |

|----------|--------|-------------|### 🔧 Reset completo

| `/api/chatgpt-smart` | POST | Chat AI con parsing intelligente |```bash

| `/api/sync-data` | POST | Sincronizzazione dati frontend |# Ferma il server (Ctrl+C)

| `/api/data` | GET | Recupera tutti i dati app |# Riavvia

| `/api/action` | POST | Esegue azioni specifiche |node server.js

# Ricarica la pagina nel browser

## 🎤 Comandi Vocali```



### Esempi Supportati:---

- `"Aggiungi 2 kg di pasta a 3€"`

- `"Aggiungi 500 g pomodori €2,50"`## 📁 Struttura File

- `"Aggiungi 1 litro latte 4 euro"`

- `"Cosa posso cucinare?"````

ChefCode/

### Logica Parsing:├── index.html          # Interfaccia principale

- **Prezzo**: Numero + valuta (€, $, euro, dollaro)├── script.js           # Logica frontend + AI

- **Quantità**: Numero + unità (kg, g, lt, pz, etc.)├── server.js           # Server Node.js + OpenAI API

- **Nome**: Ingrediente senza articoli (di, del, il, la, etc.)├── style.css           # Stili e design

├── package.json        # Dipendenze Node.js

## 🐛 Troubleshooting├── logo.svg            # Logo ChefCode

└── README.md           # Questa guida

### Problemi Comuni:```

1. **Server non raggiungibile**: Controlla `backend/start.bat`

2. **Microfono non funziona**: Verifica permessi browser---

3. **AI non sincronizza**: Prova `CHEFCODE_RESET()` in console

4. **Mobile non connette**: Aggiorna IP server## 💰 Costi AI



### Reset Completo:**GPT-3.5-turbo** (modello utilizzato):

```javascript- Input: $0.0015 per 1K token

// In console browser (F12)- Output: $0.002 per 1K token

CHEFCODE_RESET()

```**Stima uso normale**:

- ~30-50 richieste/giorno = €1-2/mese

## 📖 Guide Dettagliate- Costo bassissimo per le funzionalità offerte!



- 📚 **[Guida Completa](docs/README.md)** - Setup dettagliato---

- ⚡ **[Quick Start](docs/QUICK_START.md)** - Avvio in 3 minuti  

- 🔧 **[Debug Guide](docs/)** - Risoluzione problemi## 🎨 Features Implementate



## 🎯 Roadmap Mobile### ✅ Interfaccia

- [x] Design moderno blu/bianco

### Prossimi Passi:- [x] Footer intelligente con chat AI

1. **📱 Build APK/IPA** - App store ready- [x] Navigazione fluida tra sezioni

2. **🔐 Autenticazione** - Login utenti- [x] Responsive design

3. **☁️ Backend Cloud** - Deploy su server remoto

4. **📊 Analytics** - Dashboard metriche### ✅ Intelligenza Artificiale

5. **🔔 Notifiche Push** - Avvisi produzione- [x] ChatGPT integrato con contesto ristorante

- [x] Comandi vocali in italiano

## 📞 Supporto- [x] Parsing intelligente ingredienti

- [x] Suggerimenti ricette automatici

Per problemi o domande:- [x] Sincronizzazione dati real-time

1. Controlla **[docs/](docs/)** per guide specifiche

2. Verifica **console browser** (F12) per errori### ✅ Gestione Inventario

3. Testa **connessione server** con `http://localhost:3000/api/data`- [x] Aggiunta manuale e vocale

- [x] Tabella con filtri e ricerca

---- [x] Calcolo valori automatico

- [x] Categorizzazione prodotti

## 🏗️ Architettura Tecnica

---

### Backend:

- **Node.js + Express** - Server API REST## 🚀 Prossimi Sviluppi

- **OpenAI GPT-3.5** - Intelligenza artificiale

- **Parsing intelligente** - Comandi naturali italiani- [ ] Upload immagini con OCR

- **CORS completo** - Supporto cross-origin- [ ] Analisi costi/ricavi avanzata  

- [ ] Export dati (Excel/PDF)

### Frontend Web:- [ ] Notifiche scorte minime

- **Vanilla JavaScript** - Performance ottimizzata- [ ] Integrazione fornitori

- **Web Speech API** - Riconoscimento vocale

- **LocalStorage** - Persistenza dati---

- **Responsive Design** - Mobile-friendly

## 📞 Supporto

### Frontend Mobile:

- **React Native + Expo** - Cross-platformPer problemi o domande:

- **AsyncStorage** - Persistenza mobile1. Controlla la sezione "Risoluzione Problemi"

- **Fetch API** - Comunicazione server2. Verifica che il server sia attivo

- **Navigation** - Multi-screen3. Controlla la console del browser (F12) per errori

4. Verifica la configurazione API OpenAI

### API Layer:

- **Unified API** - Codice condiviso web/mobile  **Buon divertimento con ChefCode! 🍽️✨**
- **Error Handling** - Gestione errori robusta
- **Offline Support** - Funzionamento senza rete
- **Validation** - Controlli dati completi

---

## 🔖 **VERSIONE v2.0 - BACKUP STABILE**

### 🎯 **Tag: `v2.0`** - **VERSIONE FUNZIONANTE AL 100%**

**Questa versione rappresenta un backup sicuro e completamente funzionante di ChefCode.**

#### ✅ **Cosa funziona:**
- 🔐 **Sicurezza completa**: Nessuna API key hardcoded
- 📱 **Mobile UI perfetta**: Footer responsive, nessun overflow orizzontale
- 🤖 **AI Chat attivo**: ChatGPT integrato con toggle send/voice
- 🎨 **Design**: Glassmorphism overlay posizionato correttamente
- 🚀 **Deploy ready**: Configurazione Render ottimizzata
- 📦 **Capacitor**: APK build per Android/iOS

#### 🔄 **Come tornare a questa versione:**
```bash
git checkout v2.0
```

#### 💾 **Backup completo confermato**: 
- Data: Ottobre 4, 2025
- Commit: `3b89fb5`
- Status: ✅ **COMPLETAMENTE FUNZIONANTE**

---

*ChefCode v2.0 - Versione Sicura e Stabile 🤖🔐*