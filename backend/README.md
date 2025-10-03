# ChefCode Backend API

Backend server per l'applicazione mobile ChefCode - Sistema di gestione ristorante con AI.

## 🚀 Deploy su Render

Questo backend è configurato per il deploy automatico su Render.com.

### Variabili d'Ambiente Richieste:

- `NODE_ENV=production`
- `OPENAI_API_KEY=your_openai_api_key_here`
- `ALLOWED_ORIGINS=*`

### Comandi:

- `npm install` - Installa dipendenze
- `npm start` - Avvia server
- `npm run dev` - Modalità sviluppo

### Endpoints:

- `GET /` - Info API
- `GET /health` - Health check
- `POST /api/sync-data` - Sincronizza dati app
- `GET /api/data` - Ottieni dati app
- `POST /api/action` - Esegui azioni
- `POST /api/chatgpt-smart` - Chat AI intelligente

## 🔒 Sicurezza

- API Key OpenAI gestita tramite variabili d'ambiente
- CORS configurato per produzione
- Validazione input e gestione errori

## 📱 Compatibilità

Progettato per funzionare con:
- React Native (mobile app)
- Web browsers
- API clients