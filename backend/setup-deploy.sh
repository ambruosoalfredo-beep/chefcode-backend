#!/bin/bash
# ChefCode Backend - Quick Deploy Setup
echo "🚀 ChefCode Backend - Setup per Render Deployment"
echo "================================================="

# Controlla se siamo nella directory corretta
if [ ! -f "server.js" ] || [ ! -f "package.json" ]; then
    echo "❌ Errore: Esegui questo script dalla directory backend/"
    exit 1
fi

echo "📋 Controlli preliminari..."

# Controlla Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js non trovato. Installa Node.js 18+ prima di continuare."
    exit 1
fi

echo "✅ Node.js trovato: $(node --version)"

# Controlla npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm non trovato."
    exit 1
fi

echo "✅ npm trovato: $(npm --version)"

# Installa dipendenze
echo "📦 Installazione dipendenze..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dipendenze installate con successo"
else
    echo "❌ Errore nell'installazione delle dipendenze"
    exit 1
fi

# Test del server locale
echo "🧪 Test server locale..."
echo "Avvio server per 10 secondi..."

# Avvia server in background
npm start &
SERVER_PID=$!

# Aspetta che il server si avvii
sleep 3

# Test health check
echo "📡 Test health check..."
if command -v curl &> /dev/null; then
    HEALTH_CHECK=$(curl -s http://localhost:3000/health 2>/dev/null || echo "failed")
    if [[ $HEALTH_CHECK == *"healthy"* ]]; then
        echo "✅ Health check passato"
    else
        echo "❌ Health check fallito"
    fi
else
    echo "⚠️  curl non disponibile, salto test health check"
fi

# Ferma il server
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

# Controlla Git
if [ ! -d ".git" ]; then
    echo "📝 Inizializzo repository Git..."
    git init
    git add .
    git commit -m "Initial backend setup for Render deployment"
    echo "✅ Repository Git inizializzato"
else
    echo "✅ Repository Git già presente"
fi

echo ""
echo "🎉 Setup completato con successo!"
echo ""
echo "📋 Prossimi passi:"
echo "1. 🌐 Vai su https://render.com e crea un account"
echo "2. 📤 Push questo codice su GitHub/GitLab:"
echo "   git remote add origin https://github.com/USERNAME/chefcode-backend.git"
echo "   git push -u origin main"
echo "3. 🚀 Crea un Web Service su Render collegando il tuo repository"
echo "4. ⚙️  Configura le variabili d'ambiente:"
echo "   - NODE_ENV=production"
echo "   - OPENAI_API_KEY=la-tua-api-key"
echo "   - ALLOWED_ORIGINS=*"
echo "5. 📱 Aggiorna l'URL nell'app mobile"
echo ""
echo "📖 Documentazione completa: docs/RENDER_DEPLOYMENT.md"
echo ""