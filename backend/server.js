// Load environment variables
require('dotenv').config();

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();

// Configurazioni dalle variabili d'ambiente con valori di default
const CONFIG = {
  // Variabili obbligatorie
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  
  // CORS
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:19006,http://localhost:8081',
  
  // Sicurezza e performance
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  OPENAI_TIMEOUT: parseInt(process.env.OPENAI_TIMEOUT) || 30000,
  MAX_PAYLOAD_SIZE: parseInt(process.env.MAX_PAYLOAD_SIZE) || 10,
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  ENABLE_DETAILED_LOGS: process.env.ENABLE_DETAILED_LOGS === 'true',
  
  // Cache
  AI_CACHE_DURATION: parseInt(process.env.AI_CACHE_DURATION) || 300000,
  APP_DATA_CACHE_DURATION: parseInt(process.env.APP_DATA_CACHE_DURATION) || 60000,
  
  // Monitoraggio
  HEALTH_CHECK_INTERVAL: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000,
  EXTERNAL_TIMEOUT: parseInt(process.env.EXTERNAL_TIMEOUT) || 15000
};

// Configurazione CORS dinamica basata su environment
const allowedOrigins = CONFIG.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());

const corsOptions = {
  origin: function (origin, callback) {
    // Consenti richieste senza origin (app mobili native)
    if (!origin) return callback(null, true);
    
    // Se ALLOWED_ORIGINS contiene *, consenti tutto
    if (allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    
    // Controlla se l'origin è nella lista consentita
    if (allowedOrigins.includes(origin) || CONFIG.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      if (CONFIG.ENABLE_DETAILED_LOGS) {
        console.log(`🚫 CORS blocked origin: ${origin}`);
      }
      callback(new Error('Non autorizzato da CORS policy'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: `${CONFIG.MAX_PAYLOAD_SIZE}mb` }));

// Validazione variabili obbligatorie
if (!CONFIG.OPENAI_API_KEY) {
  console.error('❌ ERRORE: OPENAI_API_KEY non configurata nelle variabili d\'ambiente');
  console.log('🔧 Configura la variabile OPENAI_API_KEY su Render o nel file .env');
  console.log('📖 Usa il file COPY_ENV_TO_RENDER.bat per le istruzioni');
  process.exit(1);
}

// Log configurazione in sviluppo
if (CONFIG.NODE_ENV === 'development' || CONFIG.ENABLE_DETAILED_LOGS) {
  console.log('🔧 ChefCode Backend Configuration:');
  console.log(`   Environment: ${CONFIG.NODE_ENV}`);
  console.log(`   Port: ${CONFIG.PORT}`);
  console.log(`   CORS Origins: ${CONFIG.ALLOWED_ORIGINS}`);
  console.log(`   Rate Limit: ${CONFIG.RATE_LIMIT_MAX} req/min`);
  console.log(`   OpenAI Timeout: ${CONFIG.OPENAI_TIMEOUT}ms`);
  console.log(`   Log Level: ${CONFIG.LOG_LEVEL}`);
}

// Storage per i dati dell'applicazione (sincronizzato dal frontend)
let appData = {
  inventory: [],
  recipes: {},
  tasks: []
};

// Endpoint per ricevere i dati dell'applicazione
app.post('/api/sync-data', (req, res) => {
  appData = req.body;
  console.log('Dati applicazione sincronizzati:', Object.keys(appData));
  res.json({ success: true });
});

// Endpoint per ottenere i dati dell'applicazione
app.get('/api/data', (req, res) => {
  res.json(appData);
});

// Endpoint per eseguire azioni sull'applicazione
app.post('/api/action', (req, res) => {
  const { action, data } = req.body;
  console.log('Azione richiesta:', action, data);
  
  switch (action) {
    case 'add-inventory':
      appData.inventory.push(data);
      break;
    case 'update-inventory':
      const index = appData.inventory.findIndex(item => item.name === data.name);
      if (index !== -1) {
        appData.inventory[index] = { ...appData.inventory[index], ...data };
      }
      break;
    case 'remove-inventory':
      appData.inventory = appData.inventory.filter(item => item.name !== data.name);
      break;
    default:
      return res.status(400).json({ error: 'Azione non riconosciuta' });
  }
  
  res.json({ success: true, data: appData });
});

// Endpoint intelligente per chat con interpretazione comandi
app.post('/api/chatgpt-smart', async (req, res) => {
  const prompt = req.body.prompt;
  console.log('Richiesta intelligente:', prompt);
  
  // Prima verifica se è un comando che può essere eseguito
  const commandResult = await tryExecuteCommand(prompt);
  if (commandResult.executed) {
    const response = {
      choices: [{
        message: {
          content: commandResult.response
        }
      }]
    };
    
    // Se il comando ha modificato i dati, includi i nuovi dati nella risposta
    if (commandResult.shouldSync) {
      response.syncData = commandResult.newData;
    }
    
    return res.json(response);
  }
  
  // Altrimenti usa ChatGPT con il contesto completo
  const inventoryContext = appData.inventory.length > 0 
    ? `Inventario attuale: ${appData.inventory.map(item => `${item.name} (${item.quantity} ${item.unit}, €${item.price})`).join(', ')}`
    : 'Inventario vuoto';
    
  const recipesContext = Object.keys(appData.recipes).length > 0
    ? `Ricette disponibili: ${Object.keys(appData.recipes).join(', ')}`
    : 'Nessuna ricetta configurata';
    
  const systemPrompt = `Sei l'assistente intelligente di ChefCode, una piattaforma di gestione ristorante.
  
Oggi è ${new Date().toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.

STATO ATTUALE:
${inventoryContext}
${recipesContext}

CAPACITÀ:
- Suggerire ricette basate sull'inventario disponibile
- Calcolare costi delle ricette
- Aiutare con la pianificazione della produzione
- Consigliare acquisti per completare ricette
- Analizzare la profittabilità dei piatti

Rispondi sempre in italiano, sii pratico e utile per un ambiente di ristorazione professionale.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 250
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.log('Errore OpenAI:', data.error);
      res.status(400).json({ error: data.error.message });
      return;
    }
    
    res.json(data);
  } catch (err) {
    console.log('Errore nella richiesta:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Funzione smart per parsing ingredienti con logica intelligente
function parseIngredientCommand(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  console.log('🔍 Analizzando prompt:', lowerPrompt);
  
  // Rimuovi "aggiungi" dall'inizio
  const cleanPrompt = lowerPrompt.replace(/^aggiungi\s+/, '').trim();
  console.log('🧹 Prompt pulito:', cleanPrompt);
  
  // Trova tutte le valute (€, $, dollaro, euro, ecc.)
  const currencyPattern = /(€|\$|euro|dollaro|usd|eur)\s*(\d+(?:[.,]\d+)?)|(\d+(?:[.,]\d+)?)\s*(€|\$|euro|dollaro|usd|eur)/g;
  let price = 0;
  let priceMatch;
  
  while ((priceMatch = currencyPattern.exec(cleanPrompt)) !== null) {
    // Se valuta è prima del numero: gruppo 1 (valuta) e gruppo 2 (numero)
    // Se valuta è dopo il numero: gruppo 3 (numero) e gruppo 4 (valuta)
    const priceValue = priceMatch[2] || priceMatch[3];
    if (priceValue) {
      price = parseFloat(priceValue.replace(',', '.'));
      console.log('💰 Prezzo trovato:', price, priceMatch[1] || priceMatch[4]);
      break;
    }
  }
  
  // Rimuovi la parte del prezzo dal prompt
  let promptWithoutPrice = cleanPrompt.replace(currencyPattern, '').trim();
  console.log('📝 Prompt senza prezzo:', promptWithoutPrice);
  
  // Trova quantità + unità di misura
  const unitsPattern = /(kg|g|grammi|kilogrammi|lt|l|litri|ml|millilitri|pz|pezzi|pcs|confezioni|bottiglie|lattine)\s+/g;
  let quantity = 0;
  let unit = 'pz';
  
  // Cerca pattern: numero + unità
  const qtyUnitMatch = promptWithoutPrice.match(/(\d+(?:[.,]\d+)?)\s*(kg|g|grammi|kilogrammi|lt|l|litri|ml|millilitri|pz|pezzi|pcs|confezioni|bottiglie|lattine)/);
  if (qtyUnitMatch) {
    quantity = parseFloat(qtyUnitMatch[1].replace(',', '.'));
    unit = qtyUnitMatch[2];
    console.log('📊 Quantità e unità:', quantity, unit);
    
    // Rimuovi quantità e unità dal prompt
    promptWithoutPrice = promptWithoutPrice.replace(qtyUnitMatch[0], '').trim();
  } else {
    // Se non trova unità, cerca solo numero all'inizio
    const qtyMatch = promptWithoutPrice.match(/^(\d+(?:[.,]\d+)?)\s+/);
    if (qtyMatch) {
      quantity = parseFloat(qtyMatch[1].replace(',', '.'));
      promptWithoutPrice = promptWithoutPrice.replace(qtyMatch[0], '').trim();
      console.log('📊 Solo quantità trovata:', quantity);
    }
  }
  
  // Quello che rimane è il nome (rimuovi articoli)
  let name = promptWithoutPrice
    .replace(/^(di|del|della|dei|degli|delle|il|la|lo|gli|le|un|una|uno)\s+/g, '') // Rimuovi articoli all'inizio
    .replace(/\s+(di|del|della|dei|degli|delle|il|la|lo|gli|le|un|una|uno)\s+/g, ' ') // Rimuovi articoli in mezzo
    .trim();
  
  console.log('🏷️ Nome finale:', name);
  
  return { quantity, unit, name, price };
}

// Funzione per interpretare ed eseguire comandi
async function tryExecuteCommand(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  
  // Controlla se è un comando "aggiungi"
  if (lowerPrompt.startsWith('aggiungi ')) {
    const parsed = parseIngredientCommand(prompt);
    console.log('✅ Parsing risultato:', parsed);
    
    if (!parsed.name) {
      console.log('❌ Nome ingrediente non trovato');
      return {
        executed: true,
        response: '❌ Non ho capito quale ingrediente vuoi aggiungere. Prova con: "Aggiungi 2 kg di pasta a 3€"'
      };
    }
    
    if (parsed.quantity <= 0) {
      console.log('❌ Quantità non valida');
      return {
        executed: true,
        response: '❌ Specifica una quantità valida. Esempio: "Aggiungi 2 kg di pasta"'
      };
    }
    
    const newItem = {
      name: parsed.name,
      quantity: parsed.quantity,
      unit: parsed.unit,
      category: 'Aggiunto via chat',
      price: parsed.price
    };
    
    console.log('➕ Aggiungendo al server inventory:', newItem);
    appData.inventory.push(newItem);
    
    const responseMessage = parsed.price > 0 
      ? `✅ Ho aggiunto ${parsed.quantity} ${parsed.unit} di ${parsed.name} all'inventario al prezzo di €${parsed.price}!`
      : `✅ Ho aggiunto ${parsed.quantity} ${parsed.unit} di ${parsed.name} all'inventario! Puoi impostare il prezzo più tardi dalla sezione Goods In.`;
    
    console.log('📤 Preparando risposta con shouldSync=true');
    return {
      executed: true,
      response: responseMessage,
      shouldSync: true,
      newData: appData
    };
  }
  
  // Comando: cosa posso cucinare
  if (lowerPrompt.includes('cosa posso cucinare') || lowerPrompt.includes('che posso cucinare')) {
    if (appData.inventory.length === 0) {
      return {
        executed: true,
        response: `🤷‍♂️ L'inventario è vuoto! Aggiungi prima alcuni ingredienti per ricevere suggerimenti di ricette.`
      };
    }
    
    const ingredients = appData.inventory.map(item => item.name).join(', ');
    return {
      executed: true,
      response: `🍳 Con gli ingredienti disponibili (${ingredients}) posso suggerirti alcune ricette! Se hai configurato ricette specifiche in "Recipe Set-Up", posso anche calcolare i costi esatti.`
    };
  }
  
  return { executed: false };
}

app.post('/api/chatgpt', async (req, res) => {
  const prompt = req.body.prompt;
  console.log('Ricevuta richiesta:', prompt);
  
  // Prepara il contesto dell'applicazione
  const inventoryContext = appData.inventory.length > 0 
    ? `Inventario attuale: ${appData.inventory.map(item => `${item.name} (${item.quantity} ${item.unit}, €${item.price})`).join(', ')}`
    : 'Inventario vuoto';
    
  const recipesContext = Object.keys(appData.recipes).length > 0
    ? `Ricette disponibili: ${Object.keys(appData.recipes).join(', ')}`
    : 'Nessuna ricetta configurata';
    
  const systemPrompt = `Sei l'assistente intelligente di ChefCode, una piattaforma di gestione ristorante.
  
Oggi è ${new Date().toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.

STATO ATTUALE:
${inventoryContext}
${recipesContext}

CAPACITÀ:
- Suggerire ricette basate sull'inventario
- Calcolare costi delle ricette
- Aiutare con la pianificazione della produzione
- Rispondere a domande sui cibi e sulla cucina
- Interpretare comandi vocali per aggiungere ingredienti

COMANDI SPECIALI che puoi riconoscere:
- "aggiungi [quantità] [unità] di [ingrediente]" 
- "cosa posso cucinare?"
- "quanto costa fare [ricetta]?"
- "suggerisci qualcosa con [ingrediente]"

Rispondi sempre in italiano, sii pratico e utile per un ambiente di ristorazione.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 200
      })
    });
    
    const data = await response.json();
    console.log('Risposta OpenAI:', JSON.stringify(data, null, 2));
    
    // Controlliamo se c'è un errore nella risposta
    if (data.error) {
      console.log('Errore OpenAI:', data.error);
      res.status(400).json({ error: data.error.message });
      return;
    }
    
    res.json(data);
  } catch (err) {
    console.log('Errore nella richiesta:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Health check endpoint per Render
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Endpoint per info API
app.get('/', (req, res) => {
  res.json({
    name: 'ChefCode Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: [
      'GET /health - Health check',
      'GET /api/data - Get app data',
      'POST /api/sync-data - Sync app data',
      'POST /api/action - Execute actions',
      'POST /api/chatgpt-smart - Smart chat with AI'
    ]
  });
});

// Avvio server con configurazione ottimizzata
app.listen(CONFIG.PORT, '0.0.0.0', () => {
  console.log(`🚀 ChefCode Backend API running on port ${CONFIG.PORT}`);
  console.log(`🌍 Environment: ${CONFIG.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${CONFIG.PORT}/health`);
  console.log(`⚡ CORS Origins: ${CONFIG.ALLOWED_ORIGINS}`);
  console.log(`🤖 OpenAI API: ${CONFIG.OPENAI_API_KEY ? 'Configured ✅' : 'Missing ❌'}`);
  
  if (CONFIG.NODE_ENV === 'production') {
    console.log('🎯 Production mode: Optimized for Render deployment');
  }
});
