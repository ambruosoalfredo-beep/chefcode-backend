# 🍽️ ChefCode - Restaurant Management Platform

**Piattaforma completa di gestione ristorante con intelligenza artificiale integrata**

## ✨ Caratteristiche principali

### 🏪 Gestione Completa
- **Goods In**: Gestione inventario con scanner OCR e input vocale
- **Recipe Set-Up**: Configurazione ricette e calcolo costi
- **Production**: Pianificazione produzione giornaliera
- **Sales**: Gestione vendite e reportistica

### 🤖 Intelligenza Artificiale
- **ChatGPT integrato** con contesto del ristorante
- **Comandi vocali intelligenti** in italiano
- **Riconoscimento automatico** ingredienti e quantità
- **Suggerimenti ricette** basati sull'inventario disponibile

---

## 🚀 Installazione Rapida

### 1️⃣ Prerequisiti
- **Node.js** (versione 14 o superiore) - [Scarica qui](https://nodejs.org/)
- **Account OpenAI** per l'API ChatGPT - [Registrati qui](https://platform.openai.com/)

### 2️⃣ Setup del progetto

```bash
# 1. Apri il terminale nella cartella del progetto
cd "percorso/alla/cartella/ChefCode"

# 2. Installa le dipendenze (se non presenti)
npm install

# 3. Avvia il server
node server.js
```

### 3️⃣ Configurazione API OpenAI

**⚠️ IMPORTANTE**: Prima di usare l'AI devi configurare la tua API key.

1. Vai su [OpenAI Platform](https://platform.openai.com/api-keys)
2. Crea una nuova API key
3. Apri il file `server.js`
4. Sostituisci la riga 17:
```javascript
const OPENAI_API_KEY = 'LA_TUA_API_KEY_QUI';
```

### 4️⃣ Avvio dell'applicazione

1. **Avvia il server**: `node server.js`
2. **Apri il browser**: vai su `http://localhost:3000`
3. **Apri**: `index.html` nel browser

---

## 🎯 Come usare l'AI

### 💬 Chat Intelligente (Footer)
- **Scrivi** una domanda nel campo input
- **Clicca** l'aeroplano per inviare
- **Usa il microfono** per messaggi vocali
- **Clicca il +** per caricare file (in sviluppo)

### 🗣️ Comandi Vocali Intelligenti
**Esempi di comandi che l'AI capisce:**

```
"Aggiungi 5 kg di pomodori al costo di 2.50 euro"
"Cosa posso cucinare?"
"Suggerisci una ricetta con pasta"
"Quanto costa fare 10 porzioni di carbonara?"
```

### 🎙️ Parser Vocale (Destra)
- **Clicca il microfono** per comandi inventario
- **Parla chiaramente** in italiano
- **Risultati automatici** nell'inventario

---

## 🛠️ Risoluzione Problemi

### ❌ "Error: Failed to fetch"
- **Causa**: Server non avviato
- **Soluzione**: Esegui `node server.js` nel terminale

### ❌ "No response" o errori API
- **Causa**: API key non configurata/errata
- **Soluzione**: Verifica la tua API key OpenAI in `server.js`

### ❌ Riconoscimento vocale non funziona
- **Causa**: Browser non supporta o microfono negato
- **Soluzione**: Usa Chrome/Edge e consenti accesso microfono

### 🔧 Reset completo
```bash
# Ferma il server (Ctrl+C)
# Riavvia
node server.js
# Ricarica la pagina nel browser
```

---

## 📁 Struttura File

```
ChefCode/
├── index.html          # Interfaccia principale
├── script.js           # Logica frontend + AI
├── server.js           # Server Node.js + OpenAI API
├── style.css           # Stili e design
├── package.json        # Dipendenze Node.js
├── logo.svg            # Logo ChefCode
└── README.md           # Questa guida
```

---

## 💰 Costi AI

**GPT-3.5-turbo** (modello utilizzato):
- Input: $0.0015 per 1K token
- Output: $0.002 per 1K token

**Stima uso normale**:
- ~30-50 richieste/giorno = €1-2/mese
- Costo bassissimo per le funzionalità offerte!

---

## 🎨 Features Implementate

### ✅ Interfaccia
- [x] Design moderno blu/bianco
- [x] Footer intelligente con chat AI
- [x] Navigazione fluida tra sezioni
- [x] Responsive design

### ✅ Intelligenza Artificiale
- [x] ChatGPT integrato con contesto ristorante
- [x] Comandi vocali in italiano
- [x] Parsing intelligente ingredienti
- [x] Suggerimenti ricette automatici
- [x] Sincronizzazione dati real-time

### ✅ Gestione Inventario
- [x] Aggiunta manuale e vocale
- [x] Tabella con filtri e ricerca
- [x] Calcolo valori automatico
- [x] Categorizzazione prodotti

---

## 🚀 Prossimi Sviluppi

- [ ] Upload immagini con OCR
- [ ] Analisi costi/ricavi avanzata  
- [ ] Export dati (Excel/PDF)
- [ ] Notifiche scorte minime
- [ ] Integrazione fornitori

---

## 📞 Supporto

Per problemi o domande:
1. Controlla la sezione "Risoluzione Problemi"
2. Verifica che il server sia attivo
3. Controlla la console del browser (F12) per errori
4. Verifica la configurazione API OpenAI

**Buon divertimento con ChefCode! 🍽️✨**