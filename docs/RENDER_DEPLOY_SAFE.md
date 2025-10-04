# 🚀 Deploy ChefCode Backend su Render (Sicuro)

## ⚠️ IMPORTANTE: Sicurezza API Keys

**NON includere mai chiavi API nel codice che vai a caricare su GitHub!**

## 📋 Istruzioni Deploy

### 1. Preparazione Locale
```bash
# Nel backend, NON creare file .env con chiavi reali prima del commit
# Il file .env è già nel .gitignore quindi non verrà caricato
```

### 2. Deploy su Render
1. Vai su [Render.com](https://render.com)
2. Collega il tuo repository GitHub
3. Crea un nuovo **Web Service**
4. Configurazioni:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`

### 3. Configurazione Environment Variables su Render
**CRUCIALE**: Aggiungi le variabili d'ambiente nel dashboard Render:

```
OPENAI_API_KEY=la_tua_vera_api_key_openai
PORT=3000
NODE_ENV=production
```

### 4. Aggiorna URL Frontend
Nel file `www/script.js`, sostituisci:
```javascript
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000'
  : 'https://IL_TUO_RENDER_URL.onrender.com'; // ← Inserisci il tuo URL Render qui
```

### 5. Test Locale
```bash
# Backend
cd backend
npm install
# Crea .env solo localmente con la tua API key
echo "OPENAI_API_KEY=la_tua_key" > .env
node server.js

# Frontend (in altra finestra)
cd www
python -m http.server 8080
```

## 🔒 Checklist Sicurezza
- ✅ `.env` è nel `.gitignore`
- ✅ Nessuna API key hardcoded nel codice
- ✅ Environment variables configurate su Render
- ✅ URL dinamici per locale/produzione

## 🐛 Risoluzione Errori

### Errore "fetch failed"
1. Verifica che il backend sia attivo
2. Controlla URL nell'API_BASE_URL
3. Verifica CORS settings
4. Controlla le variabili d'ambiente su Render

### Errore OpenAI API
1. Verifica che OPENAI_API_KEY sia configurata
2. Controlla che la key sia valida su OpenAI
3. Verifica il credito disponibile sull'account OpenAI