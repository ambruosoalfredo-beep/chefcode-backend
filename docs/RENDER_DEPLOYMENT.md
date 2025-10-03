# 🚀 ChefCode Backend Deployment su Render

Questa guida ti aiuta a deployare il backend di ChefCode su Render.com per avere la tua API sempre online senza usare il server Metro locale.

## 📋 Prerequisiti

1. Account su [Render.com](https://render.com) (gratuito)
2. Repository Git del progetto (GitHub, GitLab, o Bitbucket)
3. API Key di OpenAI attiva

## 🔧 Step 1: Preparazione del Repository

### 1.1 Inizializza Git nel backend (se non fatto)
```bash
cd backend
git init
git add .
git commit -m "Initial backend setup for Render deployment"
```

### 1.2 Push su GitHub/GitLab
```bash
# Crea repository su GitHub e poi:
git remote add origin https://github.com/TUO_USERNAME/chefcode-backend.git
git branch -M main
git push -u origin main
```

## 🌐 Step 2: Deploy su Render

### 2.1 Accedi a Render
1. Vai su [render.com](https://render.com)
2. Fai login o registrati
3. Clicca "New +" → "Web Service"

### 2.2 Connetti Repository
1. Seleziona il tuo provider Git (GitHub/GitLab)
2. Autorizza Render ad accedere ai tuoi repository
3. Seleziona il repository `chefcode-backend`

### 2.3 Configurazione Deployment
Inserisci questi valori:

**Basic Settings:**
- **Name**: `chefcode-backend` (o nome che preferisci)
- **Region**: Europe (West) per migliori performance in Italia
- **Branch**: `main`
- **Root Directory**: lascia vuoto se il backend è nella root, oppure `backend` se è in una sottocartella

**Build & Deploy:**
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Instance Type:**
- **Plan**: `Free` (per iniziare)

### 2.4 Variabili d'Ambiente
Nella sezione "Environment Variables", aggiungi:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `OPENAI_API_KEY` | `la-tua-api-key-openai` |
| `ALLOWED_ORIGINS` | `*` (o domini specifici separati da virgola) |

⚠️ **IMPORTANTE**: Non inserire mai l'API Key di OpenAI nel codice! Usa sempre le variabili d'ambiente.

### 2.5 Deploy
1. Clicca "Create Web Service"
2. Render inizierà automaticamente il build e deploy
3. Il processo richiede 2-5 minuti

## ✅ Step 3: Verifica Deployment

### 3.1 Controlla i Log
1. Vai alla dashboard del tuo servizio su Render
2. Clicca su "Logs" per vedere i log in tempo reale
3. Dovresti vedere: `🚀 ChefCode Backend API running on port XXXX`

### 3.2 Test dell'API
Apri nel browser: `https://your-service-name.onrender.com`
Dovresti vedere:
```json
{
  "name": "ChefCode Backend API",
  "version": "1.0.0",
  "status": "running",
  "endpoints": [...]
}
```

### 3.3 Health Check
Vai su: `https://your-service-name.onrender.com/health`
Dovresti vedere:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-03T...",
  "environment": "production"
}
```

## 📱 Step 4: Configura l'App Mobile

### 4.1 Aggiorna URL Backend
Nel file `frontend/mobile/src/App.js`, trova:
```javascript
const BACKEND_CONFIG = {
  production: 'https://your-chefcode-backend.onrender.com', // ← CAMBIA QUESTO
  // ...
}
```

Sostituisci `your-chefcode-backend` con il nome del tuo servizio Render.

### 4.2 Test dall'App
1. Riavvia l'app mobile: `npm start`
2. Verifica nei logs: dovrebbe mostrare "✅ Backend connected successfully"
3. Testa le funzionalità ChatGPT e sync dati

## 🔄 Step 5: Aggiornamenti Futuri

### 5.1 Deploy Automatico
Render fa deploy automatico ad ogni push su `main`:
```bash
git add .
git commit -m "Update backend"
git push origin main
```

### 5.2 Rollback
Se qualcosa va storto:
1. Vai su Render Dashboard
2. Clicca "Deploys"
3. Trova un deploy funzionante e clicca "Redeploy"

## 🔐 Sicurezza e Best Practices

### ✅ Cosa è Implementato
- ✅ API Key nelle variabili d'ambiente
- ✅ CORS configurato per domini specifici
- ✅ Health check endpoint
- ✅ Error handling e logging
- ✅ Timeout e retry automatici

### 🔧 Miglioramenti Futuri
- 🔜 Autenticazione JWT
- 🔜 Rate limiting
- 🔜 Database persistente (MongoDB/PostgreSQL)
- 🔜 Backup automatici
- 🔜 Monitoring e alerts

## 🆘 Troubleshooting

### Problema: "Application failed to respond"
**Soluzione**: Verifica che il server sia in ascolto su `0.0.0.0` e non `localhost`
```javascript
app.listen(PORT, '0.0.0.0', () => { ... })
```

### Problema: "OPENAI_API_KEY not configured"
**Soluzione**: Verifica che la variabile d'ambiente sia impostata correttamente su Render

### Problema: CORS errors dall'app mobile
**Soluzione**: Aggiungi il dominio dell'app nella variabile `ALLOWED_ORIGINS`

### Problema: Build fallisce
**Soluzione**: Controlla i log del build, spesso mancano dipendenze in `package.json`

## 📊 Monitoring

### Log in Tempo Reale
```bash
# Dalla dashboard Render, vai su "Logs"
# Oppure usa Render CLI:
render logs -s your-service-name --tail
```

### Metriche
- **CPU Usage**: Monitora nella dashboard
- **Memory Usage**: Disponibile nei log
- **Response Time**: Testa con `/health` endpoint

## 💰 Costi

**Piano Gratuito Render:**
- ✅ 750 ore/mese (sempre attivo)
- ✅ Sleep dopo 15 min inattività
- ✅ SSL automatico
- ❌ No custom domain (usa .onrender.com)

**Piano Paid ($7/mese):**
- ✅ Sempre attivo (no sleep)
- ✅ Custom domain
- ✅ Più risorse CPU/RAM

## 🎉 Completato!

Il tuo backend ChefCode è ora online 24/7 su Render! 🚀

**URL Finale**: `https://your-service-name.onrender.com`

Aggiorna questo URL nell'app mobile e sei pronto per usare ChefCode senza server locale!